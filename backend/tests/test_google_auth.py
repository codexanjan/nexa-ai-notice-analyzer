from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.api.google_auth import id_token

def test_google_identity_and_account_linking(monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test.apps.googleusercontent.com")
    claims = {"sub": "google-student", "email": "google-user@gmail.com", "email_verified": True, "name": "Google Student"}
    monkeypatch.setattr(id_token, "verify_oauth2_token", lambda *args: claims.copy())
    with TestClient(app) as client:
        config = client.get('/api/auth/google/config').json()
        payload = {"credential": "verified-test-token", "challenge": config['challenge']}
        assert client.post('/api/auth/google', json=payload).status_code == 401
        claims['nonce'] = config['nonce']
        result = client.post('/api/auth/google', json={**payload, "role": "ADMIN"})
        assert result.status_code == 200
        assert result.json()['user']['role'] == 'STUDENT'
        uid = result.json()['user']['id']
        assert client.post('/api/auth/google', json=payload).json()['user']['id'] == uid
        assert client.post('/api/auth/login', json={"email": claims['email'], "password": "random123"}).status_code == 401
        claims.update(sub='google-admin', email='admin@nexa.edu')
        assert client.post('/api/auth/google', json=payload).status_code == 409
        linked = client.post('/api/auth/google', json={**payload, "password": "admin123"})
        assert linked.status_code == 200
        assert linked.json()['user']['role'] == 'ADMIN'
        assert client.post('/api/auth/google', json=payload).status_code == 200
        claims['email_verified'] = False
        assert client.post('/api/auth/google', json=payload).status_code == 401
        assert client.post('/api/auth/google', json={**payload, "challenge": "forged"}).status_code == 401

def test_google_unconfigured_and_invalid_token(monkeypatch):
    with TestClient(app) as client:
        monkeypatch.setattr(settings, 'GOOGLE_CLIENT_ID', '')
        assert client.get('/api/auth/google/config').json()['enabled'] is False
        assert client.post('/api/auth/google', json={"credential": "bad", "challenge": "bad"}).status_code == 503
        monkeypatch.setattr(settings, 'GOOGLE_CLIENT_ID', 'test.apps.googleusercontent.com')
        config = client.get('/api/auth/google/config').json()
        def reject(*args):
            raise ValueError('expired or invalid signature/audience')
        monkeypatch.setattr(id_token, 'verify_oauth2_token', reject)
        assert client.post('/api/auth/google', json={"credential": "bad", "challenge": config['challenge']}).status_code == 401
