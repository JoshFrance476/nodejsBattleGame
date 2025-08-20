# Node.JS Grid Battle Game

## Overview
This project implements a simple two-player online board game where players take turns moving troops around a grid and initiating battles with each other. The gameplay itself is very simple as the focus was learning to create real time multi-user webpages.

## Features
- Real time multi-user server with Socket.IO
- HTTP server handling with Express
- Dynamic page rendering with EJS templates
- JSON API for frontend-backend interaction
- Object-oriented Javascript with custom Board and Tile classes
- Managing asynchronous events to ensure consistent game state
- Basic error handling and state validation to ensure valid gameplay

## Technologies
- Node.js
- Express
- EJS
- Socket.IO
- JavaScript


## How to Run
- Install dependencies: 'npm install'
- Start server: `npm start`  
- Once the server is running, open `http://localhost:3000`  
- The first user should select `Join as Host` and then the second player (or in another tab to test) `Join as Guest`  
- The host will then be given a button to start game.  
- Players then take turns moving troops, with the host starting.
