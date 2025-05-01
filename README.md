# PASTA.ai - Personalized Assistant for Self-Improvement and Target Achievement

This is a React Native application that combines multiple AI-driven functionalities, including a **Personality Test**, **Chatbots for Task Management and Health assistance**. The app also includes **Firebase Authentication** for user login and registration.

---

## 🚀 Features

### 🧠 Personality Test
- Users can take a personality test that evaluates traits like **Extraversion, Agreeableness, Conscientiousness, Neuroticism, and Openness to Experience**.

### 💬 Chatbot Functionalities
- **General Chat**: A simple chatbot for conversations.
- **Fitness Chatbot**: Offers **nutrition and exercise recommendations**.

### ✅ Task Manager
- Users can **create, edit, and delete tasks** to manage their daily activities.

### 🔒 Authentication
- **Firebase Authentication** is used for **user login and signup**.
- Custom **drawer navigation** displays user details and provides a logout option.

---

## 🛠️ Technologies Used

- **React Native** - For cross-platform mobile development
- **Expo** - For easy development and deployment
- **Firebase Authentication** - For secure user authentication
- **React Navigation** - For managing screens and navigation
- **React Native Safe Area Context** - For handling safe area views on different devices
- **React Native Vector Icons** - For adding icons in UI components
- **Flask API** - Backend server to handle AI-based responses
- **Groq AI Models** - Provides responses for chatbots and web searches
- **YFinance API** - Fetches stock-related financial data

---

## 📦 Installation

### Prerequisites
Make sure you have the following installed:
- **Node.js**
- **Expo CLI**
- **Firebase Project Setup** (Refer to Firebase documentation)
- **Python & Flask** (for running the API server)

### Clone the Repository
```sh
git clone https://github.com/MrNoBody86/PASTA.ai.git
cd PASTA-App
```

### Install Dependencies
```sh
npm install
```

### Run the App
```sh
npx expo start
```
or
```sh
npm start
```

### Start the Flask API Server
1. Create a folder in your PC and install Virtual Environment (venv).
2. Activate venv by typing the following command in terminal and press enter.
    ```sh
    .\venv\Scripts\Activate.ps1
    ```
3. Copy all the files from FlaskAPI_Server to your folder.
4. Type the following command to install the python packages.
    ```sh
    pip install requirements.txt
    ```
5. Replace the API Keys in .env with your keys.
6. Add serviceAccountKey.json from Firebase for reading and writing data from firestore.
7. The folder structure should look like this

    ![Backend Server folder Structure](PASTA-App/assets/images/Backend%20Server%20Directory%20Structure.png)
    
8. Now run the python application.
    ```sh
    python app.py
    ```
9. Deploy the directory on Render or Vercel to integrate it with frontend.

---

## 📁 React Native Project Structure

![Backend Server folder Structure](PASTA-App/assets/images//Frontend%20Directory%20Structure.png)

---

## ⚡ How to Use
1. **Sign up / Login** using Firebase Authentication.
2. **Take a personality test** and view your results.
3. **Chat with AI bots** for financial or fitness advice.
4. **Use the task manager** to track your daily tasks.
5. **Logout securely** from the drawer menu.

---

## 🔧 Troubleshooting

### VirtualizedList Error
If you encounter the error:
> "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation"

**Solution**: Replace `<ScrollView>` with `<View>` inside `App.js` where `NavigationContainer` is wrapped.

### Firebase Errors
Ensure that your **FirebaseConfig.js** is correctly set up with your **API Key and Auth Domain**.

---

## 📌 Future Enhancements
- Add **push notifications** for reminders.
- Improve **AI chatbot responses** with better training data.
- Introduce **dark mode** for better UI experience.
- Optimize performance with **background data fetching**.
- Add **Fitness Tracker** page for tracking your fitness activities.

---

## 🤝 Contributing
Feel free to fork the repository and submit pull requests. Contributions are welcome!

---

## 📜 License
This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## ✉️ Contact
For any inquiries or support, reach out to **jmkl0987@gmail.com**.

