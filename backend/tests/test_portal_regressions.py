import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import LocalCollection

def login(client, role):
    result = client.post('/api/auth/login', json={'email': f'{role}@nexa.edu', 'password': f'{role}123'})
    assert result.status_code == 200
    return {'Authorization': 'Bearer ' + result.json()['access_token']}

def test_roles_tasks_drafts_uploads_and_notifications():
    with TestClient(app) as client:
        admin, student = login(client, 'admin'), login(client, 'student')
        assert client.get('/api/tasks').status_code == 401
        assert client.post('/api/auth/register', json={'name':'Intruder','email':'test@example.com','password':'test1234','role':'ADMIN'}).status_code == 403
        notice = {'title':'Private draft','content':'Students must register tomorrow for examination.', 'status':'DRAFT'}
        assert client.post('/api/notices', json=notice).status_code == 401
        assert client.post('/api/notices', json=notice, headers=student).status_code == 403
        draft = client.post('/api/notices', json=notice, headers=admin).json()
        assert client.get('/api/notices/' + draft['id']).status_code == 404
        assert draft['id'] not in [n['id'] for n in client.get('/api/notices').json()]
        assert client.get('/api/notices/' + draft['id'], headers=admin).status_code == 200
        task = client.post('/api/tasks', headers=student, json={'title':'Submit application','deadline':'unknown date'}).json()
        assert client.put('/api/tasks/' + task['id'], headers=admin, json={'status':'Completed'}).status_code == 404
        assert client.delete('/api/tasks/' + task['id'], headers=admin).status_code == 404
        assert client.put('/api/tasks/' + task['id'], headers=student, json={'status':'Completed'}).status_code == 200
        assert client.get('/api/deadlines', headers=student).status_code == 200
        notifications = client.get('/api/notifications', headers=student).json()
        assert notifications
        nid = notifications[0]['id']
        assert client.put('/api/notifications/' + nid + '/read', headers=student).status_code == 200
        assert client.get('/api/notifications', headers=student).json()[0]['read'] is True
        assert client.get('/api/notifications', headers=admin).json()[0]['read'] is False
        uploaded = client.post('/api/notices/upload', headers=admin, files={'file':('notice.txt', b'Students must submit exam registration tomorrow.', 'text/plain')})
        assert uploaded.status_code == 200
        assert 'submit' in uploaded.json()['extracted_text']
        assert client.post('/api/notices/upload', files={'file':('notice.txt', b'example')}).status_code == 401

def test_numeric_sort_and_notification_queries(tmp_path):
    async def exercise():
        col = LocalCollection('test', tmp_path / 'test.json')
        for score, owner in [(9, 'a'), (100, 'b'), (80, None)]:
            await col.insert_one({'score':score, 'user_id':owner})
        docs = await col.find(sort=[('score', -1)])
        assert [d['score'] for d in docs] == [100, 80, 9]
        docs = await col.find({'$or':[{'user_id':'a'}, {'user_id':None}]})
        assert len(docs) == 2
    asyncio.run(exercise())
