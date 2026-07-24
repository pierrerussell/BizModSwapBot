# BizModSwapBot

## 🛠 Project Structure

The project consists of two parts:

- **Frontend (`/react`)**: Built with React, TypeScript, and Vite. Uses `@telegram-apps/telegram-ui` for a native look.
- **Backend (`/src`)**: Built with ASP.NET Core and Entity Framework Core. Handles data persistence, authentication, and matching logic.

## 🏁 Getting Started

### Backend

1. Navigate to `src/BizModSwapBot.API`.
2. Configure your database connection in `appsettings.json`.
3. Set your `Telegram:BotToken` in `appsettings.json`.
4. Run `dotnet run`.

### Frontend

1. Navigate to the `react` directory.
2. Install dependencies: `npm install`.
3. Start the development server: `npm run dev`.

## 🤝 Contributing

To contribute:

1. **Fork** the repository.
2. **Create a branch** for your feature or bug fix (`git checkout -b feature/amazing-feature`).
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`).
4. **Push to the branch** (`git push origin feature/amazing-feature`).
5. **Open a Pull Request**.

Tests not needed but at least ensure the code compiles please.

## 🐛 Raising Issues

If you find a bug or have a feature request, please open an issue on GitHub.

When reporting a bug, please include:
- A clear description of the issue.
- Steps to reproduce.
- Expected vs. actual behavior.
- Screenshots if applicable.
