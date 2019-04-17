const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../server-test');
require('dotenv').config();

const basePath = process.env.SERVICE_PATH || '/customer-service';

beforeEach(async () => {
  const databasePath = path.join(__dirname, '/../app/database/rules.json');
  if (fs.existsSync(databasePath)) {
    await fs.unlink(databasePath);
  }
});

describe('integration tests', () => {
  it('challenge back-end test', async () => {
    const rule1 = await request(app)
      .post(`${basePath}/rules`)
      .send({
        type: 'specific_day',
        specific_day: '25-06-2018',
        intervals: [
          {
            start_time: '09:30',
            end_time: '10:20'
          },
          {
            start_time: '10:30',
            end_time: '11:00'
          }
        ],
        rule_name: 'rule1'
      })
      .expect(200);
    expect(rule1.body.data.rule).toBeDefined();

    let rule2 = await request(app)
      .post(`${basePath}/rules`)
      .send({
        type: 'daily',
        intervals: [
          {
            start_time: '09:30',
            end_time: '10:10'
          }
        ],
        rule_name: 'rule2'
      })
      .expect(403);
    expect(rule2.body.errors[0].code).toBe('RULE_EXISTS');

    const rule3 = await request(app)
      .post(`${basePath}/rules`)
      .send({
        type: 'weekly',
        week_days: ['monday', 'wednesday'],
        intervals: [
          {
            start_time: '14:00',
            end_time: '14:30'
          }
        ],
        rule_name: 'rule3'
      })
      .expect(200);
    expect(rule3.body.data.rule).toBeDefined();

    const deleteRule1 = await request(app).delete(`${basePath}/rules/rule1`);
    expect(deleteRule1.body.message).toBeDefined();

    // insert rule2 again
    rule2 = await request(app)
      .post(`${basePath}/rules`)
      .send({
        type: 'daily',
        intervals: [
          {
            start_time: '09:30',
            end_time: '10:10'
          }
        ],
        rule_name: 'rule2'
      })
      .expect(200);
    expect(rule2.body.data.rule).toBeDefined();

    const getRules = await request(app)
      .get(`${basePath}/rules`)
      .expect(200);
    expect(getRules.body.data.rules).toBeDefined();

    const getAvailableSchedules = await request(app)
      .get(
        `${basePath}/available-schedules?start_date=25-01-2018&end_date=29-01-2018`
      )
      .expect(200);
    expect(getAvailableSchedules.body.length > 0).toBe(true);

    return true;
  });
});
