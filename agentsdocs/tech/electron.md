# Electron Development

This document defines the standards for building and maintaining Electron applications in this repository.

## Build Standards

*   **Preferred Tool:** Use `electron-builder` for creating high-quality builds.
*   **Target:** Focus on creating **portable EXEs** or installers for Windows.
*   **Process:** Ensure that the build configuration in `package.json` is correctly set up for production-ready artifacts.

## IPC (Inter-Process Communication)

*   **Synchronization:** If you modify the UI to call new backend functions, you MUST update `preload.js` to expose these new IPC channels.
*   **Security:** Follow Electron security best practices, including context isolation and ensuring IPC channels are strictly defined and validated.
*   **Responsiveness:** Ensure that the frontend remains connected and responsive to the main process, providing feedback for long-running operations.
