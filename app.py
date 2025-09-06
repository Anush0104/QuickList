from flask import Flask, render_template, request, jsonify
from datetime import datetime
import uuid

app = Flask(__name__)

# In-memory storage
tasks = {}

@app.route("/")
def index():
    return render_template("index.html")

# Get all tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(list(tasks.values()))

# Add task
@app.route("/add", methods=["POST"])
def add_task():
    data = request.get_json()
    text = data.get("task") or data.get("text", "")
    text = text.strip()
    if not text:
        return jsonify({"error": "Task cannot be empty"}), 400

    task_id = str(uuid.uuid4())
    new_task = {
        "id": task_id,
        "text": text,
        "done": False,
        "created_at": datetime.now().isoformat()
    }
    tasks[task_id] = new_task
    return jsonify(new_task), 201

# Toggle complete
@app.route("/toggle/<task_id>", methods=["PATCH"])
def toggle_task(task_id):
    if task_id not in tasks:
        return jsonify({"error": "Task not found"}), 404
    tasks[task_id]["done"] = not tasks[task_id]["done"]
    return jsonify(tasks[task_id])

# Delete task
@app.route("/delete/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    if task_id not in tasks:
        return jsonify({"error": "Task not found"}), 404
    del tasks[task_id]
    return jsonify({"message": "Task deleted"})

if __name__ == "__main__":
    print("🚀 Simple Todo Backend running...")
    app.run(debug=True, host="0.0.0.0", port=5000)
