#!/bin/bash

# Auth views
mkdir -p views/auth

cat > views/auth/login.ejs << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <%- include('../partials/nav') %>
  <main>
    <div class="container" style="max-width: 500px;">
      <%- include('../partials/flash') %>
      <h1>Login</h1>
      <form method="POST" action="/auth/login">
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" required>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
        <a href="/auth/register" class="btn btn-secondary">Register Instead</a>
      </form>
    </div>
  </main>
  <%- include('../partials/footer') %>
  <script src="/js/main.js"></script>
</body>
</html>
EOF

cat > views/auth/register.ejs << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <%- include('../partials/nav') %>
  <main>
    <div class="container" style="max-width: 600px;">
      <%- include('../partials/flash') %>
      <h1>Register</h1>
      <form method="POST" action="/auth/register">
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>NYU Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" required minlength="6">
        </div>
        <div class="form-group">
          <label>Role</label>
          <select name="role" required id="roleSelect">
            <option value="">Select your role</option>
            <option value="sound_student">Sound Student</option>
            <option value="director">Director</option>
            <option value="producer">Producer</option>
          </select>
        </div>
        <div class="form-group" id="specializationsGroup" style="display:none;">
          <label>Specializations (select all that apply)</label>
          <div class="checkbox-group">
            <div class="checkbox-item"><input type="checkbox" name="specializations" value="Sound Mixer"><label>Sound Mixer</label></div>
            <div class="checkbox-item"><input type="checkbox" name="specializations" value="Boom Operator"><label>Boom Operator</label></div>
            <div class="checkbox-item"><input type="checkbox" name="specializations" value="Sound Designer"><label>Sound Designer</label></div>
            <div class="checkbox-item"><input type="checkbox" name="specializations" value="Dialogue Editor"><label>Dialogue Editor</label></div>
            <div class="checkbox-item"><input type="checkbox" name="specializations" value="Foley Artist"><label>Foley Artist</label></div>
            <div class="checkbox-item"><input type="checkbox" name="specializations" value="ADR Engineer"><label>ADR Engineer</label></div>
            <div class="checkbox-item"><input type="checkbox" name="specializations" value="Mixing Engineer"><label>Mixing Engineer</label></div>
          </div>
        </div>
        <div class="form-group">
          <label>Bio (optional)</label>
          <textarea name="bio"></textarea>
        </div>
        <div class="form-group">
          <label>Expected Graduation Year (optional)</label>
          <input type="number" name="year" min="2024" max="2030">
        </div>
        <button type="submit" class="btn btn-primary">Register</button>
        <a href="/auth/login" class="btn btn-secondary">Login Instead</a>
      </form>
    </div>
  </main>
  <%- include('../partials/footer') %>
  <script src="/js/main.js"></script>
  <script>
    document.getElementById('roleSelect').addEventListener('change', function() {
      document.getElementById('specializationsGroup').style.display = 
        this.value === 'sound_student' ? 'block' : 'none';
    });
  </script>
</body>
</html>
EOF

echo "Created auth views"
