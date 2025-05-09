import React, { useState } from 'react';
// import { GoogleLogin } from '@react-oauth/google';

// Google login, this asks now username and password too. I dont know if it is necessary. 
// Username could be nice to have.
// If we dont make passwd, user have to login with google always
// I did not really make sending data to backend, there is a fetch try-catch code for that, I dont know if it works

interface LoginProps {
  onLoginSuccess: (userInfo: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleLoginSuccess = (response: any) => {
    const token = response.credential;
    if (!token) return console.error('No credential returned from Google');

    const payload = JSON.parse(atob(token.split('.')[1]));
    setUserInfo({ ...payload, username: '', password: '' });
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    if (!username || !password) return alert('Please enter a username!');
    
    const updatedUserInfo = {
      ...userInfo,
      username,
      password,
    };


//something like this to send data to backend
/*
    try {
      const response = await fetch('https://your-backend-endpoint.com/api/login', {
        method: 'POST', // POST method to send data
        headers: {
          'Content-Type': 'application/json', // Tell the backend to expect JSON data
        },
        body: JSON.stringify(updatedUserInfo), // Convert the data to JSON string
      });

      if (!response.ok) {
        throw new Error('Failed to send data to backend');
      }

      const result = await response.json(); // Get response if needed
      console.log('Backend response:', result);
      onLoginSuccess(updatedUserInfo); // Call the onLoginSuccess if successful
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting the form. Please try again.');
    }
*/

    console.log('Updated user info:', updatedUserInfo); //you can see data in console
    
    
    setTimeout(() => {
      onLoginSuccess(updatedUserInfo); 
    }, 1000);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
      {!isFormVisible ? (
        <div className="flex flex-col items-center space-y-4">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log('Login failed')}
          />
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md w-80 flex flex-col items-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your username"
            className="border p-2 rounded-md mb-4"
          />
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="border p-2 rounded-md mb-4 w-full"
          />
          <button
            onClick={handleFormSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;