import axios from 'axios';

export function receiveFriendRequests() {
    return axios.get('/friend-requests').then( ({data}) => {
        return {
            type: 'RECEIVE_FRIEND_REQUESTS',
            users: data.users
        };
    });
}


export function acceptFriendRequest(id) {
    return axios.post('/accept', {otherUserId: id}).then(function() {
        return {
            type: 'ACCEPT_FRIEND_REQUESTS',
            id
        };
    });
}


export function endFriendship(id) {
    return axios.post('/end', {otherUserId: id}).then(function() {
        return {
            type: 'END_FRIENDSHIP',
            id
        };
    });
}


export function onlineUsers(users) {
    return {
        type: 'ONLINE_USERS',
        onlineUsers: users.users
    };
}


export function userJoined(newUser) {
    return {
        type: 'USER_JOINED',
        newUser: newUser.newUser
    };
}

export function userLeft(leavingUser) {
    return {
        type: 'USER_LEFT',
        leaverId: leavingUser.leavingUser.userId
    };
}

export function chatMessages(messages) {
    return {
        type: 'CHAT_MESSAGES',
        messages: messages.messages
    };
}

export function chatMessage(newMessage) {
    return {
        type: 'CHAT_MESSAGE',
        newMessage: newMessage.newMessage
    };
}

export function friendRequests(requests) {
    return {
        type: 'FRIEND_REQUESTS',
        requests: requests.requests
    };
}

export function newFriendRequest(newRequest) {
    return {
        type: 'NEW_FRIEND_REQUEST',
        newRequest: newRequest.newRequest
    };
}

export function acceptPendingRequest(changeOfRequests) {
    return {
        type: 'ACCEPT_PENDING_REQUEST',
        changeOfRequests: changeOfRequests.changeOfRequests
    };
}
