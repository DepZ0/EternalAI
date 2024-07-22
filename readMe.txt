Hello, welcome to Eternal AI.

Sign-Up {
    For sign-up we can use GOOGLE ACCOUNT send POST request to /auth/google-auth
    or use default method:
        send POST request to "/auth/sign-up" and point "email", "password"
        EXAMPLE - /auth/sign-up , body {email: eternal@ai.com, password: 123456}
}

Login {
    For login we need to do POST request
    to /auth/login and point our "email", "password"
    EXAMPLE - /auth/login , body {email: eternal@ai.com, password: 123456}
}

Check our Profile {
    For look at our Profile we need to do GET request to /profile
}

Change profile details {
    For change your account detail such as phone number, email, password
    you need to send POST request to /change-details and you can point "phone", "email", "password".
    
    BUT if you was logged with GOOGLE ACCOUNT you can change ONLY phone number!
}

Refreshing access token {
    You must be logged and send POST request to /refresh-token
    and after that you will get Access Token to Cookie
}

Buy subscription {
    For buy subscription you must be logged
    and make POST request to /buy-sub
    after successful payment you can see redirect to /success
}

Chatting with Famous People's {
    Make POST request to /name-surname and set body {message: Hello, how are you?},
    After this request you will get answer from server with ALL your chat with selected bot.
    
    Available Famous People's [ steve-jobs, stephan-bandera, britney-spears, joanne-rowling, elon-musk]
}

Clearing chats {
    For clear chat make DELETE request to /name-surname/clear-chat-history

    Available Famous People's [ steve-jobs, stephan-bandera, britney-spears, joanne-rowling, elon-musk]
}

Test chats {
    If user don’t have account, this user can choose default questions for Famous People,
    send GET request to /test-chat/name-surname
}

Notice:
    If user don’t have account - can choose default questions for Famous People;
    If user have account but don’t have sub - can send only 5 messages to Famous People but can't clear chats;
    If user have account and sub - can send nolimit messages and can clear chats;
    If you was logged with GOOGLE ACCOUNT you can change ONLY phone number;

Available routes - [ /auth/google-auth, /auth/sign-up, /auth/login,
                     /profile, /change-details, /refresh-token, 
                     /buy-sub, /name-surname, /name-surname/clear-chat-history ]

Available Famous People's [ steve-jobs, stephan-bandera, britney-spears, joanne-rowling, elon-musk ].