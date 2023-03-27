import express from 'express';
import cors from 'cors';
import moment from 'moment';

import { Gitlab } from './gitlab'

const app: express.Application = express();

app.use(cors());

const gitLab = new Gitlab(
  'https://gitlab.com/api/v4', 'REPLACE-TOKEN', '34950049',
);


app.get('/project', async (req, res) => {
  try {
    const project = await gitLab.project();
    return res.send(project);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get('/members', async (req, res) => {
  try {
    const members = await gitLab.members();
    return res.send(members);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get('/issues', async (req, res) => {
  try {
    const query: any = {
      pagination: 'keyset',
      per_page: req.query.per_page || 20,
      page: req.query.page || 1,
      order_by: 'created_at',
      sort: 'desc',
    };
    if (req.query.start && req.query.end) {
      query.updated_after = moment(req.query.start.toString()).startOf('day').toISOString();
      query.updated_before = moment(req.query.end.toString()).endOf('day').toISOString();
    }
    if (req.query.author_id) {
      query.author_id = req.query.author_id;
    } 
    if (req.query.not){
      console.log(req.query);
      Object.keys(req.query.not).forEach(key => {
        query[`not[${key}]`] = req.query.not[key];
      });
    }
    console.log(query);
    const issues = await gitLab.issues(query, true);
    return res.send(issues);
  } catch (err) {
    console.log(err);
    res.send(err);
  }

});

app.get('/issues_statistics/:by?', async (req, res) => {
  try {
    const { by } = req.params;
    const start: string = (req.query.start || '').toString();
    const end: string = (req.query.end || '').toString();
    const query: any = {};
    query.updated_after = moment(start || moment().add(-30, 'day').toDate()).startOf('day').toISOString();
    query.updated_before = moment(end || new Date()).endOf('day').toISOString();
    if (req.query.author_id) {
      query.author_id = req.query.author_id;
    }
    if (req.query.not) {
      Object.keys(req.query.not).forEach(key => {
        query[`not[${key}]`] = req.query.not[key];
      });
    }
    switch (by) {
      case 'members':
        const members = await gitLab.members();
        const members_statistics = await Promise.all(members.map(async m => {
          const statistics = await gitLab.issuesStatistics({ assignee_id: m.id, ...query });
          statistics.member = {
            memberId: m.id,
            username: m.username,
            name: m.name,
          };
          statistics.params = req.query;
          return statistics;
        }));
        return res.send(members_statistics);
      case 'milestones':
        const milestones = await gitLab.milestones();
        const milestones_statistics = await Promise.all(milestones.map(async m => {
          const statistics = await gitLab.issuesStatistics({ assignee_id: m.id, ...query });
          statistics.member = {
            memberId: m.id,
            title: m.title,
          };
          statistics.params = req.query;
          return statistics;
        }));
        return res.send(milestones_statistics);
      case 'priority':
        const _labels = [
          'Priority::Urgent',
          'Priority::Important',
          'Priority::Medium',
          'Priority::Low',
        ];
        const labels = (await gitLab.labels()).filter(l => _labels.includes(l.name));
        const labels_statistics = await Promise.all(labels.map(async m => {
          const statistics = await gitLab.issuesStatistics({ labels: m.name, ...query });
          statistics.label = {
            memberId: m.id,
            name: m.name,
            color: m.color, 
            text_color: m.text_color, 
          };
          statistics.params = req.query;
          return statistics;
        }));
        return res.send(labels_statistics);
      case 'all':
      default:
        const all = await gitLab.issuesStatistics(query);
        all.params = req.query;
        return res.send(all);
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get('/milestones', async (req, res) => {
  try {
    const milestones = await gitLab.milestones();
    return res.send(milestones);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get('/labels', async (req, res) => {
  try {
    const labels = await gitLab.labels();
    return res.send(labels);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.listen(3200, () => {
  console.log('App is listening on port 3200!');
});
