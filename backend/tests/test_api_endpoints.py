import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

def test_full_api_workflow():
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # 2. Login as admin
        login_res = client.post("/api/auth/login", json={
            "email": "admin@nexa.edu",
            "password": "admin123"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        admin_data = login_res.json()
        assert "access_token" in admin_data
        admin_token = admin_data["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}

        # 3. List seeded notices
        notices_res = client.get("/api/notices")
        assert notices_res.status_code == 200
        notices = notices_res.json()
        assert len(notices) >= 4
        print(f"Verified {len(notices)} seeded notices.")

        # 4. AI Analyze Endpoint
        ai_res = client.post("/api/ai/analyze", json={
            "content": "All students are informed that the internal assessment examination will be conducted on Monday at 10 AM. Students must carry their college ID cards."
        })
        assert ai_res.status_code == 200
        ai_data = ai_res.json()
        assert ai_data["category"]["value"] == "EXAMINATION"
        assert ai_data["importance"]["score"] >= 50
        assert len(ai_data["explanation"]) > 0

        # 5. Create new notice via Admin
        create_res = client.post("/api/notices", headers=headers, json={
            "title": "Urgent Laboratory Safety Briefing",
            "content": "Mandatory laboratory safety briefing scheduled for tomorrow at 2 PM. Attendance is strictly compulsory.",
            "category": "WORKSHOP",
            "department": "Chemistry Dept",
            "deadline": "tomorrow"
        })
        assert create_res.status_code == 200
        created_notice = create_res.json()
        assert created_notice["importance"] > 0
        notice_id = created_notice["id"]

        # 6. Deadlines endpoint
        deadlines_res = client.get("/api/deadlines")
        assert deadlines_res.status_code == 200
        deadlines_data = deadlines_res.json()
        assert "due_today" in deadlines_data
        assert "due_this_week" in deadlines_data

        # 7. Tasks endpoint
        tasks_res = client.get("/api/tasks")
        assert tasks_res.status_code == 200
        tasks = tasks_res.json()
        assert len(tasks) >= 2

        # 8. Analytics Dashboard
        analytics_res = client.get("/api/analytics/dashboard")
        assert analytics_res.status_code == 200
        dash = analytics_res.json()
        assert dash["total_notices"] >= 5
        assert len(dash["categories"]) >= 3
        assert len(dash["importance_distribution"]) == 4

        print("All API endpoints tested successfully with 100% assertions passing!")

if __name__ == "__main__":
    test_full_api_workflow()
