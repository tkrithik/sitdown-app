# Contributing to SitDown App

Thank you for your interest in contributing to SitDown! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Reports** - Help us identify and fix issues
- **💡 Feature Requests** - Suggest new features or improvements
- **📝 Documentation** - Improve our docs and code comments
- **🎨 UI/UX Improvements** - Enhance the user experience
- **🧪 Testing** - Help test features and report issues
- **🔧 Code Contributions** - Submit pull requests with improvements

### Before You Start

1. **Check existing issues** - Your idea might already be discussed
2. **Read the documentation** - Understand how the app works
3. **Set up development environment** - Follow the setup guide in README.md

## 🚀 Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Git

### Local Development

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/sitdown-app.git
   cd sitdown-app
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Start development server**
   ```bash
   npm start
   ```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names

### React Native
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error boundaries
- Optimize for performance

### File Organization
- Keep components in `src/components/`
- Place screens in `src/screens/`
- Store services in `src/services/`
- Use consistent file naming (PascalCase for components)

### Code Formatting
- Use 2 spaces for indentation
- End files with newline
- Use semicolons
- Follow existing code style

## 🔄 Pull Request Process

### Creating a Pull Request

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, focused commits
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link related issues
   - Request reviews from maintainers

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(chat): add message reactions
fix(auth): resolve login issue on Android
docs(readme): update installation instructions
```

## 🧪 Testing

### Manual Testing
- Test on both iOS and Android
- Test different screen sizes
- Verify all features work as expected
- Check for performance issues

### Automated Testing
- Write unit tests for new features
- Ensure existing tests pass
- Add integration tests when appropriate

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Update README for new features
- Include usage examples

### API Documentation
- Document new API endpoints
- Update service interfaces
- Include parameter descriptions

## 🐛 Bug Reports

### Before Reporting
1. Check if the issue is already reported
2. Try to reproduce the issue
3. Check if it's a device-specific issue

### Bug Report Template
```
**Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Device: [e.g., iPhone 12, Samsung Galaxy S21]
- OS: [e.g., iOS 15.0, Android 12]
- App Version: [e.g., 1.0.0]

**Additional Context**
Any other information that might help
```

## 💡 Feature Requests

### Feature Request Template
```
**Problem Statement**
Describe the problem you're trying to solve

**Proposed Solution**
Describe your proposed solution

**Alternative Solutions**
Any alternatives you've considered

**Additional Context**
Screenshots, mockups, or examples
```

## 🏷️ Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `priority: low` - Low priority issue

## 📞 Getting Help

### Questions and Discussions
- Use GitHub Discussions for questions
- Check existing discussions first
- Be respectful and patient

### Code Reviews
- Be open to feedback
- Respond to review comments
- Learn from suggestions

## 🎯 Contribution Ideas

### Good First Issues
- Fix typos in documentation
- Add missing TypeScript types
- Improve error messages
- Add loading states

### Advanced Contributions
- Implement new chat features
- Add analytics and monitoring
- Optimize performance
- Add accessibility features

## 📄 License

By contributing to SitDown, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

---

**Thank you for contributing to SitDown! 🎉**

Your contributions help make this app better for food lovers everywhere.
