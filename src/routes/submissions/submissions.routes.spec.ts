import * as request from 'supertest';
import * as express from 'express';
import { plainToClass } from 'class-transformer';

import { Child, Submissions } from '../../database/entity';
import { submissionRoutes } from './submissions.routes';

const noImage =
    'data:image/jpeg;base64,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';

const child: Child = plainToClass(Child, {
    id: 1,
    username: 'Sarah Lang',
    grade: 3,
    parent: {
        id: 1,
        email: 'test@mail.com',
        password: 'I Am Password',
        children: undefined,
    },
    cohort: {
        week: 3,
    },
    preferences: {
        dyslexia: false,
    },
    submissions: [
        {
            id: 1,
            week: 1,
            story: { page1: '', page2: '', page3: '', page4: '', page5: '' },
            storyText: 'Text1',
            illustration: '',
        },
        {
            id: 2,
            week: 2,
            story: { page1: '', page2: '', page3: '', page4: '', page5: '' },
            storyText: 'Text2',
            illustration: '',
        },
    ],
});

import typeorm = require('typeorm');
typeorm.getRepository = jest.fn().mockReturnValue({
    save: jest
        .fn()
        .mockImplementation(async (submission: Submissions) => ({ ...submission, id: 3 })),
    update: jest.fn().mockImplementation(async () => ({ affected: 1 })),
    delete: jest.fn().mockImplementation(async () => ({ affected: 1 })),
});

jest.mock('../../middleware', () => ({
    Only: () => (req, res, next) => {
        next();
    },
}));

const userInjection = (req, res, next) => {
    req.user = child;
    next();
};

const bodyInjection = (req, res, next) => {
    if (req.body) res.locals.body = req.body;
    next();
};

const app = express();
app.use('/submissions', express.json(), userInjection, bodyInjection, submissionRoutes);

describe('GET /submissions', () => {
    it("should list child's submissions", async () => {
        const { body } = await request(app).get('/submissions');
        expect(body.submissions).toHaveLength(2);
    });
});

describe('GET /submissions/:week', () => {
    it("should list child's submission for the week", async () => {
        const { body } = await request(app).get('/submissions/1');
        expect(body.submission.id).toBe(1);
    });

    it('should return 404 if it does not exist', async () => {
        await request(app)
            .get('/submissions/3')
            .expect(404);
    });
});

describe('POST /submissions', () => {
    it('should return 201 on creation', async () => {
        await request(app)
            .post('/submissions')
            .send({
                storyText: 'Text3',
                illustration: '',
                story: {
                    page1: '',
                    page2: '',
                    page3: '',
                    page4: '',
                    page5: '',
                },
            })
            .expect(201);
    });

    it('should transcribe text from image', async () => {
        const { body } = await request(app)
            .post('/submissions')
            .send({
                storyText: '',
                illustration: '',
                story: {
                    page1: noImage,
                    page2: '',
                    page3: '',
                    page4: '',
                    page5: '',
                },
            });
        expect(body.transcribed.images[0].trim()).toBe('no image');
    });

    it('should return 400 if already exists', async () => {
        child.cohort.week = 1;
        await request(app)
            .post('/submissions')
            .send({
                storyText: 'Text2',
                illustration: '',
                story: {
                    page1: '',
                    page2: '',
                    page3: '',
                    page4: '',
                    page5: '',
                },
            })
            .expect(400);
        child.cohort.week = 3;
    });
});

describe('DELETE /submissions/:week', () => {
    it('should return 200 on deletion', async () => {
        await request(app)
            .delete('/submissions/2')
            .expect(200);
    });

    it('should return 404 if it does not exist', async () => {
        await request(app)
            .delete('/submissions/3')
            .expect(404);
    });
});
