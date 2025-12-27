# Contributing to ChatBoat

Thank you for your interest in contributing to ChatBoat! We welcome contributions from everyone. This guide will help you understand our contribution process.

## Table of Contents

- [Getting Started](#getting-started)
- [Making Changes](#making-changes)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)
- [Code Review Process](#code-review-process)

---

## Getting Started with Contributing

### 1. Fork the Repository

- Click the "Fork" button on the [GitHub repository page](https://github.com/yourusername/chatboat)
- This creates a copy under your GitHub account

### 2. Clone Your Fork

```bash
git clone https://github.com/rahul-kr-rai/chatboat.git
cd chatboat
```

### 3. Add Upstream Remote

Keep your fork synced with the original repository:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/chatboat.git
git fetch upstream
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Making Changes

### Step 1: Create a Feature Branch

Use descriptive branch names following this pattern:
- `feature/feature-name` - for new features
- `fix/bug-name` - for bug fixes
- `docs/update-name` - for documentation
- `refactor/description` - for refactoring

```bash
# Sync with upstream first
git fetch upstream
git checkout upstream/main

# Create and switch to your feature branch
git checkout -b feature/amazing-feature
```

### Step 2: Make Your Changes

- Edit files as needed for your feature or bug fix
- Keep changes focused and atomic
- Write meaningful commit messages

```bash
git add .
git commit -m "feat: Add amazing feature that improves user experience"
```

**Commit Message Format:**

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(auth): Add Google OAuth login functionality
fix(chat): Resolve message display issue on mobile
docs: Update API documentation
refactor(frontend): Improve component structure
```

### Step 3: Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### Step 4: Test Your Changes

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
# Check for lint errors
npm run lint
```

---

## Submitting Pull Requests

### Step 1: Push to Your Fork

```bash
git push origin feature/amazing-feature
```

### Step 2: Create a Pull Request

1. Go to the original [repository](https://github.com/yourusername/chatboat)
2. Click "Compare & pull request" or "New Pull Request"
3. Ensure the base branch is `main` and compare branch is your feature branch
4. Fill out the PR template:

```markdown
## Description
A clear description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
How can this change be tested?

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests passed locally with my changes
```

### Step 3: Respond to Review Feedback

- Maintainers may request changes or ask questions
- Update your branch with requested changes
- Push again; the PR updates automatically
- Respond to comments and questions

---

## Coding Standards

### JavaScript/Node.js

Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

**Key Guidelines:**
- Use ES6+ syntax (arrow functions, const/let, template literals)
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent indentation (2 spaces)
- No console.log in production code

```javascript
// ✅ Good
const getUserData = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// ❌ Avoid
function get_user_data(uid){
  var u = User.findById(uid);
  return u;
}
```

### React/JSX

- Use functional components with hooks
- Keep components small and focused
- Use destructuring for props
- Use PascalCase for component names
- Use camelCase for functions and variables
- Prop validation (PropTypes or TypeScript if available)

```jsx
// ✅ Good
const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);
  
  return (
    <div className="user-profile">
      {user && <h1>{user.name}</h1>}
    </div>
  );
};

export default UserProfile;

// ❌ Avoid
const userProfile = (props) => {
  const [u, setU] = useState(null);
  return <div>{props.userData}</div>;
};
```

### CSS

- Use meaningful class names
- Follow BEM naming convention when possible
- Avoid inline styles
- Keep related styles organized
- Use consistent spacing (2 spaces for indentation)

```css
/* ✅ Good */
.chat-container {
  display: flex;
  flex-direction: column;
}

.chat-container__messages {
  flex: 1;
  overflow-y: auto;
}

/* ❌ Avoid */
.chatContainer {
  display: flex; flex-direction: column;
}
.messages { overflow: auto; }
```

### Code Review Checklist

Before submitting, verify:

- [ ] Code follows project style guide
- [ ] No debugging code (console.log, debugger)
- [ ] Comments explain "why", not "what"
- [ ] No hardcoded sensitive data (API keys, passwords)
- [ ] Tests included (if applicable)
- [ ] Existing tests still pass
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Error handling is implemented
- [ ] Performance considered
- [ ] Documentation updated

---

## Reporting Issues

### Before Reporting

1. Check [existing issues](https://github.com/yourusername/chatboat/issues)
2. Search for similar problems
3. Try to reproduce with the latest code

### Creating an Issue

Use the issue templates or provide:

**1. Title** (clear and concise)
```
✅ Login fails with Google OAuth on Safari
❌ Bug in authentication
```

**2. Description**

```markdown
## Describe the Bug
A clear description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Enter '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
[If applicable, add screenshots]

## Environment
- OS: [e.g., Windows 10, macOS, Ubuntu]
- Browser: [e.g., Chrome 120, Safari 17]
- Node version: [e.g., 18.0.0]
- MongoDB version: [if relevant]

## Logs
[Paste any relevant error messages or logs]

## Additional Context
Any other context that might help.
```

### Feature Requests

```markdown
## Description
A clear description of the feature.

## Use Case
Why would you need this feature?

## Proposed Solution
Your suggested implementation.

## Alternatives Considered
Other approaches you've thought of.

## Additional Context
Any other information.
```

---

## Code Review Process

### What Maintainers Look For

- ✅ Code quality and adherence to standards
- ✅ Tests and test coverage
- ✅ Documentation and comments
- ✅ Performance implications
- ✅ Security considerations
- ✅ Backwards compatibility

### Timeline

- **Initial review**: Within 3 business days
- **Approval**: PRs may require 1-2 approvals
- **Merge**: After all checks pass and reviews are approved

### Common Feedback

- **Request changes**: Address comments and push updates
- **Approve**: Your changes look good!
- **Comment**: Discussion or questions (doesn't block merge)

---

## Development Tips

### Useful Commands

```bash
# Backend
cd backend
npm start              # Start development server
npm run lint          # Lint code (if available)

# Frontend
cd frontend
npm run dev           # Start dev server
npm run build         # Create production build
npm run lint          # Check code quality
npm run preview       # Preview production build
```

### Debugging

**Backend:**
```bash
# Add to server.js
console.log('Debug:', variable);

# Or use Node debugger
node inspect server.js
```

**Frontend:**
```javascript
// Use browser DevTools
console.log('Debug:', variable);
debugger; // Browser will pause here
```

### Database

- Use MongoDB locally or MongoDB Atlas for development
- Keep a separate `.env` file with test credentials
- Document any schema changes

---

## Need Help?

- 📖 Check the main [README.md](README.md)
- 📋 See [INSTALLATION.md](INSTALLATION.md) for detailed setup
- 🔌 Check [API.md](API.md) for API documentation
- 💬 Open an issue with the `question` label
- 📧 Contact maintainers at support@chatboat.dev

---

## Code of Conduct

By participating, you agree to:

- Be respectful and inclusive
- No harassment, discrimination, or offensive behavior
- Constructive feedback only
- Report inappropriate behavior to maintainers

---

**Thank you for contributing to ChatBoat!** 🚀
