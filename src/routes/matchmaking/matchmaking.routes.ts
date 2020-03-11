import { Router } from 'express'
import { getRepository } from 'typeorm';
import { runScript } from '../../util/scripts/scripting'
const matchmaking_test = require('./matchmaking_test.json')
import { attemptJSONParse } from '../../util/utils';

import { Only } from '../../middleware'
import { Admin, Matches, Submissions } from '../../database/entity'
import { Matchmaking, WeekMatches } from '../../models';
import { connection } from '../../util/typeorm-connection';

// a route allowing users to generate matchmaking via a button
// this can likely double for time-trigger
// ideas:
// 1) we could make the frontend trigger a call to the route if the time limit has been reached to generate matchmaking
// store result within 'Matches' entity


const matchMakingRoutes = Router();

// post route blocked by Only(Admin)
// to pass submissions within fe specified round
// into matchmaking and populate matches in db
matchMakingRoutes.post('/:week', Only(Admin), async (req, res) => {
    // roundInfo is anything we can use to refer to the round
    // route receives round info,
    // filter out the submissions within the round
    // pass into matchmaking
    // persist the matches



    const submissions = await getRepository(Submissions, connection()).find({ where: { week: req.params.week, type: 'story' } })

    let submissionObject = {}
    submissions.forEach(submission =>
        Object.assign(submissionObject, {
            [submission.child.id]: {
                flesch_reading_ease: submission.flesch_reading_ease,
                smog_index: submission.smog_index,
                flesch_kincaid_grade: submission.flesch_kincaid_grade,
                coleman_liau_index: submission.coleman_liau_index,
                automated_readability_index: submission.automated_readability_index,
                dale_chall_readability_score: submission.dale_chall_readability_score,
                difficult_words: submission.difficult_words,
                linsear_write_formula: submission.linsear_write_formula,
                gunning_fog: submission.gunning_fog,
                doc_length: submission.doc_length,
                quote_count: submission.quote_count,
                transcribed_text: submission.transcribed_text
            }
        }
        ))

    const competitions = await match(submissionObject)

    //3 persist the match

    for (let [key, value] of Object.entries(competitions)) {
        await getRepository(Matches, connection()).save({
            team1_child1_id: parseInt(value.team_1[0]),
            team1_child2_id: parseInt(value.team_1[1]),
            team2_child1_id: parseInt(value.team_2[0]),
            team2_child2_id: parseInt(value.team_2[1]),
            week: parseInt(req.params.week)
        })  
    }

    res.status(200).json({ message: `success`})
        //4 return success  
    
    try {
    } catch (err) {
        res.status(500).json(err.toString());
    }
});

function match(data: Matchmaking){
    return runScript  
        './src/util/scripts/matchmaking.py', 
        data, 
        (out:any) => out.map(attemptJSONParse))
}

export { matchMakingRoutes };