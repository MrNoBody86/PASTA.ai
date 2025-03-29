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
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### Install Dependencies
```sh
npm install
```

### Run the App
```sh
npx expo start
```

### Start the Flask API Server
Navigate to your API folder and run:
```sh
python app.py
```

---

## 📁 Project Structure

```
📂 root-directory
│── 📂 components  # React Native UI components
│── 📂 screens     # Application screens
│── 📂 images      # Image assets
│── 📂 api         # Backend API integration
│── 📄 App.js      # Main application entry point
│── 📄 FirebaseConfig.js  # Firebase setup
│── 📄 package.json  # Project dependencies
│── 📄 README.md  # Project documentation
```

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

---

## 🤝 Contributing
Feel free to fork the repository and submit pull requests. Contributions are welcome!

---

## 📜 License
This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## ✉️ Contact
For any inquiries or support, reach out to **your-email@example.com**.

