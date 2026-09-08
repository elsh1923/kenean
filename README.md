<div align="center">

# Canaan Hub (Kenean)
### Digital Faith Learning Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-kenean--2pmd.vercel.app-C9A24B?style=for-the-badge)](https://kenean-2pmd.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]()

A comprehensive faith learning hub featuring structured video lessons, digital books, and an interactive community Q&A system.

</div>

---

## 📌 The Problem
Access to high-quality, structured religious education materials is often fragmented. Learners struggle to find resources that are both well-organized and available in a modern, mobile-friendly digital format, making consistent learning difficult.

## 💡 The Solution: Canaan Hub
**Canaan Hub** centralizes faith-based education into a single, accessible platform. By combining multimedia learning (video streaming), an integrated reading experience (digital books), and community interaction (Q&A), the platform provides a holistic environment for spiritual growth and education.

## ✨ Key Features
- **Structured Video Lessons**: High-quality video streaming for sequential, module-based learning.
- **Digital Library**: Built-in access to curated digital books and reading materials.
- **Community Q&A System**: Interactive forums where users can ask questions, share insights, and engage with community leaders.
- **Mobile-Friendly UI**: A fully responsive, modern interface designed to work seamlessly across mobile devices, tablets, and desktops.

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: Tailwind CSS
- **Features**: Video Streaming integration, custom Q&A backend logic
- **Deployment**: Vercel (Frontend) / Docker

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed (v16 or higher), or Docker if you prefer containerized execution.

### Standard Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elsh1923/kenean.git
   cd kenean
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add any necessary environment variables.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

### 🐳 Running with Docker
This project is configured with a multi-stage Docker build for optimized standalone Next.js deployments.

1. **Build the image:**
   ```bash
   docker build -t kenean-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 -d kenean-app
   ```
   The application will be running on `http://localhost:3000`.

## 🌍 Links & Contact
- **Live Platform**: [https://kenean-2pmd.vercel.app/](https://kenean-2pmd.vercel.app/)
- **Developer**: Elshaday Dagne Demessie ([Portfolio](https://github.com/elsh1923/portfoliowebsite))
- **Email**: [elshadaydagne480@gmail.com](mailto:elshadaydagne480@gmail.com)
