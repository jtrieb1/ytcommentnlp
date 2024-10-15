# ytcommentnlp

ytcommentnlp is a web application that scrapes YouTube comments from a given video and performs sentiment analysis on them. Users can also download the results as a CSV file.

## Features

- Scrape YouTube comments from any video
- Perform sentiment analysis on the comments
- Download the analysis results as a CSV file

## Technologies Used

- **Frontend**: React with Vite
- **Backend**: Flask

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/ytcommentnlp.git
    cd ytcommentnlp
    ```

2. Install frontend dependencies:
    ```bash
    cd frontend
    npm install
    ```

3. Install backend dependencies:
    ```bash
    cd ../backend
    python3 -m venv venv
    source ./venv/bin/activate
    pip install -r requirements.txt
    ```

4. Install backend training data:
    ```bash
    python3 -m nltk.downloader all
    ```

## Usage

1. Start the backend server:
    ```bash
    cd backend
    flask --app main run
    ```

2. Start the frontend development server:
    ```bash
    cd ../frontend
    npm run dev
    ```

3. Open your browser and navigate to `http://localhost:3000`.

## License

This project is licensed under the MIT License.