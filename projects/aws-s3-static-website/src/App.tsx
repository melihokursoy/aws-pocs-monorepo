import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="header">
        <h1>AWS S3 Static Website</h1>
        <p>Deployed with CDK</p>
      </header>

      <main className="main">
        <section className="card">
          <h2>React + TypeScript + Vite</h2>
          <p>This is a static website deployed to AWS S3 using CDK.</p>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </section>

        <section className="card">
          <h2>Features</h2>
          <ul>
            <li>Built with React 18</li>
            <li>TypeScript for type safety</li>
            <li>Vite for fast development</li>
            <li>AWS CDK for infrastructure</li>
            <li>S3 static hosting</li>
          </ul>
        </section>

        <section className="card">
          <h2>AWS Architecture</h2>
          <ul>
            <li>S3 Bucket for static content</li>
            <li>CloudFront Distribution for CDN</li>
            <li>IAM policies for secure access</li>
            <li>Automated deployments via CDK</li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        <p>AWS Training POC - Static Website Deployment</p>
      </footer>
    </div>
  )
}

export default App
