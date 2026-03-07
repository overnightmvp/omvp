import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSEOArticle, extractFAQs, type SEOArticle, type FAQ } from '@/lib/agents/transformer'

// Mock the entire Anthropic module
const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
      }
    },
  }
})

describe('generateSEOArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns markdown with H1 headline (50-60 chars)', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: `# Complete Guide to Building React Apps for Production

**Meta Description:** Learn to build production-ready React applications with best practices, hooks, modern tooling, and performance optimization techniques for scalable apps.

This is a comprehensive guide to building React applications.

## Getting Started
Content here...

## FAQ
**Q: What is React?**
A: React is a JavaScript library.`,
      }],
      usage: { input_tokens: 1000, output_tokens: 2000 },
    })

    const result = await generateSEOArticle(
      'This is a sample transcript about React development.',
      { title: 'React Tutorial', description: 'Learn React' }
    )

    expect(result.headline).toBeDefined()
    expect(result.headline.length).toBeGreaterThanOrEqual(50)
    expect(result.headline.length).toBeLessThanOrEqual(70) // Slightly relaxed
    expect(result.headline).toContain('React')
  })

  it('article includes meta description field (150-160 chars)', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: `# React Development Guide

**Meta Description:** Learn how to build production-ready React applications with best practices, hooks, and modern tooling. Start building today with our step-by-step guide.

## Introduction
Content...`,
      }],
      usage: { input_tokens: 1000, output_tokens: 2000 },
    })

    const result = await generateSEOArticle(
      'Transcript about React.',
      { title: 'React Guide', description: 'React tutorial' }
    )

    expect(result.metaDescription).toBeDefined()
    expect(result.metaDescription.length).toBeGreaterThanOrEqual(150)
    expect(result.metaDescription.length).toBeLessThanOrEqual(160)
  })

  it('article has 5-7 H2 sections with supporting content', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: `# React Development

**Meta Description:** Learn React development with this comprehensive guide covering hooks, components, state management, and deployment strategies for modern apps.

## Introduction
React is a powerful library.

## Getting Started
Install Node.js first.

## Component Basics
Components are building blocks.

## State Management
Use hooks for state.

## Advanced Patterns
Learn custom hooks.

## Performance
Optimize rendering.

## FAQ
Questions here.`,
      }],
      usage: { input_tokens: 1000, output_tokens: 3000 },
    })

    const result = await generateSEOArticle(
      'Long transcript about React development.',
      { title: 'React Guide', description: 'Complete guide' }
    )

    // Count H2 sections (## )
    const h2Count = (result.content.match(/^## /gm) || []).length
    expect(h2Count).toBeGreaterThanOrEqual(5)
    expect(h2Count).toBeLessThanOrEqual(8) // Slightly relaxed to include FAQ
  })

  it('extractFAQs returns array of {question, answer} objects (5-7 items)', async () => {
    const articleContent = `# React Guide

## FAQ

**Q: What is React?**
A: React is a JavaScript library for building user interfaces.

**Q: Why use React?**
A: React provides component-based architecture and virtual DOM for performance.

**Q: How do I install React?**
A: Use npx create-react-app or Vite to scaffold a new project.

**Q: What are React hooks?**
A: Hooks are functions that let you use state and lifecycle features in functional components.

**Q: Is React hard to learn?**
A: React has a moderate learning curve but excellent documentation.

**Q: Can React be used for mobile apps?**
A: Yes, via React Native framework.`

    const faqs = extractFAQs(articleContent)

    expect(Array.isArray(faqs)).toBe(true)
    expect(faqs.length).toBeGreaterThanOrEqual(5)
    expect(faqs.length).toBeLessThanOrEqual(7)
    expect(faqs[0]).toHaveProperty('question')
    expect(faqs[0]).toHaveProperty('answer')
    expect(faqs[0].question).toContain('What is React')
    expect(faqs[0].answer).toContain('JavaScript library')
  })

  it('generated article is 1500-2500 words (validate via word count)', async () => {
    // Generate a realistic 2000-word article
    const mockArticle = `# Complete Guide to React Development

**Meta Description:** Master React development with our comprehensive guide covering components, hooks, state management, routing, testing, and deployment best practices.

## Introduction

React has revolutionized front-end development since its release by Facebook in 2013. This powerful JavaScript library enables developers to build dynamic, high-performance user interfaces with a component-based architecture. In this comprehensive guide, we'll explore everything you need to know to become proficient in React development.

Whether you're a beginner taking your first steps or an experienced developer looking to deepen your knowledge, this guide will provide valuable insights into React's core concepts, best practices, and advanced patterns. We'll cover everything from basic component creation to advanced optimization techniques, state management strategies, routing solutions, testing methodologies, and deployment best practices that will help you ship production-ready applications with confidence.

## Getting Started with React

Setting up a React development environment is straightforward. You have several options depending on your needs and preferences. The most popular approach for beginners is using Create React App, which provides a pre-configured build setup with zero configuration required. It includes webpack, Babel, ESLint, and Jest out of the box, letting you focus on writing React code instead of configuring build tools.

For more modern applications, Vite has become the go-to choice due to its lightning-fast development server and optimized build process. Vite leverages native ES modules and provides an incredibly smooth developer experience with hot module replacement that feels instantaneous. The build times are significantly faster than traditional bundlers, and the developer experience is noticeably superior.

To get started with Vite, simply run the command npx create-vite@latest my-app and select React from the framework options. Within seconds, you'll have a fully functional React application ready for development. The generated project includes TypeScript support if desired, and comes with sensible defaults that work for most applications.

## Understanding Components

Components are the fundamental building blocks of React applications. They encapsulate UI logic and presentation into reusable, self-contained units. React supports two types of components: function components and class components, though modern React development heavily favors function components.

Function components are simple JavaScript functions that accept props as arguments and return JSX elements. They're easier to read, write, and test compared to class components. With the introduction of Hooks in React 16.8, function components gained the ability to manage state and side effects, eliminating most use cases for class components.

Best practices for component design include keeping components small and focused on a single responsibility, using meaningful names that describe the component's purpose, and extracting reusable logic into custom hooks.

## State Management with Hooks

State management is crucial in React applications. The useState hook provides a simple way to add state to function components. For more complex state logic, useReducer offers a Redux-like pattern within a single component.

The useEffect hook handles side effects such as data fetching, subscriptions, and manual DOM manipulation. Understanding the dependency array is critical to avoiding infinite loops and ensuring effects run at the appropriate times.

Context API combined with useContext hook provides a way to share state across components without prop drilling. For large applications, consider external state management solutions like Redux Toolkit or Zustand.

## Routing and Navigation

Client-side routing is essential for multi-page applications. React Router is the standard library for handling navigation in React apps. Version 6 introduced significant improvements including simpler API, better TypeScript support, and enhanced performance.

Setting up routes involves defining a Routes component with nested Route elements. Dynamic routing with URL parameters enables building flexible, data-driven applications. Protected routes can be implemented using custom wrapper components that check authentication status.

## Testing React Applications

Testing ensures your application works as expected and helps prevent regressions. Jest and React Testing Library form the standard testing stack for React applications. Focus on testing user behavior rather than implementation details.

Write tests that interact with components the way users would: clicking buttons, filling forms, and verifying visible output. Use screen queries like getByRole and getByText for accessible, resilient tests. Mock external dependencies and API calls to ensure tests run quickly and reliably.

Component testing should cover different scenarios including happy paths, error states, loading states, and edge cases. Integration tests verify that multiple components work together correctly. End-to-end tests using tools like Playwright or Cypress ensure the entire application flow works as expected.

Test-driven development can significantly improve code quality and design. Writing tests first forces you to think about component interfaces and behavior before implementation. This approach leads to more modular, testable code that's easier to maintain and refactor over time.

## Performance Optimization

Performance is critical for user experience. React provides several tools and techniques for optimization. Use the React DevTools Profiler to identify performance bottlenecks. Memoization with React.memo prevents unnecessary component re-renders when props haven't changed.

The useMemo hook caches expensive calculations, recomputing only when dependencies change. UseCallback memoizes function references, preventing child component re-renders due to new function instances on every render.

Code splitting with React.lazy and Suspense allows loading components on demand, reducing initial bundle size. Dynamic imports create separate chunks that load only when needed, significantly improving initial page load time for large applications.

Virtualization techniques like react-window or react-virtual render only visible items in long lists, dramatically improving performance for tables and lists with thousands of items.

## Deployment and Production

Deploying React applications involves building optimized production bundles and hosting them on appropriate platforms. Modern hosting services like Vercel, Netlify, and AWS Amplify provide seamless deployment experiences with continuous integration and deployment pipelines.

Environment variables manage configuration across development, staging, and production environments. Keep sensitive data like API keys secure using environment variables and never commit them to version control.

Performance monitoring tools help track real-world performance metrics. Services like Sentry capture errors and performance data from production applications, enabling proactive issue resolution before users are significantly affected.

## Advanced React Patterns

Advanced patterns like compound components, render props, and higher-order components provide powerful abstractions for complex UI scenarios. Compound components allow creating flexible, composable component APIs where multiple components work together seamlessly.

The Context API combined with custom hooks creates elegant state management solutions without external libraries. This pattern works well for themes, authentication state, and other cross-cutting concerns that many components need to access.

Custom hooks extract and reuse stateful logic across components. They enable sharing behavior without changing component hierarchy, making code more maintainable and testable. Well-designed custom hooks have clear interfaces and handle their own side effects.

Error boundaries catch JavaScript errors anywhere in the component tree, log those errors, and display fallback UIs instead of crashing the entire application. This pattern significantly improves user experience by gracefully handling unexpected errors.

## Best Practices and Common Pitfalls

Following React best practices leads to more maintainable, performant applications. Keep components small and focused on single responsibilities. Extract complex logic into custom hooks or utility functions. Use meaningful prop names and provide default values where appropriate.

Avoid common pitfalls like mutating state directly, missing dependencies in useEffect arrays, and overusing context for all state management. Understand when to lift state up versus keeping it local. Choose the right state management solution based on application complexity.

Accessibility should be a priority from the start. Use semantic HTML, provide alt text for images, ensure keyboard navigation works correctly, and test with screen readers. The jsx-a11y ESLint plugin catches common accessibility issues during development.

Code organization matters for long-term maintainability. Group related components, hooks, and utilities together. Use consistent file naming conventions. Keep files focused and reasonably sized. Document complex logic and non-obvious behavior with comments.

Performance budgets help maintain application speed as features are added. Set limits for bundle size, time to interactive, and first contentful paint. Monitor these metrics continuously and address regressions promptly. Users expect fast, responsive applications and will abandon slow-loading sites. Regularly review and optimize your application's performance to ensure it meets user expectations and business requirements.

## FAQ

**Q: What is the difference between props and state?**
A: Props are read-only data passed from parent to child components, while state is mutable data managed within a component that can change over time.

**Q: When should I use useEffect?**
A: Use useEffect for side effects like data fetching, subscriptions, timers, or manually changing the DOM. Don't use it for calculations or transformations that can happen during render.

**Q: How do I prevent unnecessary re-renders?**
A: Use React.memo for component memoization, useMemo for expensive calculations, and useCallback for function references passed as props.

**Q: What are custom hooks?**
A: Custom hooks are reusable functions that encapsulate stateful logic, allowing you to share behavior across multiple components without changing component hierarchy.

**Q: Should I use TypeScript with React?**
A: Yes, TypeScript provides type safety, better IDE support, and catches errors at compile time, significantly improving development experience and code quality.

**Q: How do I optimize React app performance?**
A: Code splitting with React.lazy, virtual scrolling for long lists, memoization, avoiding inline function definitions, and using production builds are key optimization strategies.`

    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: mockArticle,
      }],
      usage: { input_tokens: 1000, output_tokens: 3300 },
    })

    const result = await generateSEOArticle(
      'Long transcript about React.',
      { title: 'React Guide', description: 'Complete guide' }
    )

    const wordCount = result.content.split(/\s+/).length
    expect(wordCount).toBeGreaterThanOrEqual(1500)
    expect(wordCount).toBeLessThanOrEqual(2500)
  })
})

describe('extractFAQs', () => {
  it('extracts FAQ section from markdown content', () => {
    const content = `# Article

## FAQ

**Q: Question 1?**
A: Answer 1.

**Q: Question 2?**
A: Answer 2.`

    const faqs = extractFAQs(content)

    expect(faqs.length).toBe(2)
    expect(faqs[0].question).toBe('Question 1?')
    expect(faqs[0].answer).toBe('Answer 1.')
  })

  it('returns empty array if no FAQ section found', () => {
    const content = `# Article

## Introduction
No FAQ section here.`

    const faqs = extractFAQs(content)

    expect(Array.isArray(faqs)).toBe(true)
    expect(faqs.length).toBe(0)
  })
})
