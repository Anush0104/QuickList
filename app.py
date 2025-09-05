from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Task format: {"id": 1, "text": "Do homework", "done": False}
tasks = []
task_id = 1

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks)

@app.route("/add", methods=["POST"])
def add_task():
    global task_id
    data = request.get_json()
    text = data.get("task", "").strip()
    if text:
        new_task = {"id": task_id, "text": text, "done": False}
        tasks.append(new_task)
        task_id += 1
        return jsonify(new_task), 201
    return jsonify({"error": "Task cannot be empty"}), 400

@app.route("/delete/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    global tasks
    tasks = [t for t in tasks if t["id"] != task_id]
    return jsonify({"message": "Task deleted"})

@app.route("/toggle/<int:task_id>", methods=["PATCH"])
def toggle_task(task_id):
    for t in tasks:
        if t["id"] == task_id:
            t["done"] = not t["done"]
            return jsonify(t)
    return jsonify({"error": "Task not found"}), 404

@app.route("/clear_completed", methods=["DELETE"])
def clear_completed():
    global tasks
    tasks = [t for t in tasks if not t["done"]]
    return jsonify({"message": "All completed tasks cleared"})
    

if __name__ == "__main__":
    app.run(debug=True)
