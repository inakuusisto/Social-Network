export default function(state = {}, action) {
    if (action.type == 'RECEIVE_FRIEND_REQUESTS') {
        state = Object.assign({}, state, {
            users: action.users
        });
    }
    if (action.type == 'ACCEPT_FRIEND_REQUESTS') {
        state = Object.assign({}, state, {
            users: state.users.map(function(user) {
                if (user.id == action.id) {
                    return Object.assign({}, user, {
                        status: 1
                    });
                }
                return user;
            })
        });
    }
    if (action.type == 'END_FRIENDSHIP') {
        state = Object.assign({}, state, {
            users: state.users.map(function(user) {
                if (user.id == action.id) {
                    return Object.assign({}, user, {
                        status: 5
                    });
                }
                return user;
            })
        });
    }
    if (action.type == 'ONLINE_USERS') {
        state = Object.assign({}, state, {
            onlineUsers: action.onlineUsers
        });
    }
    if (action.type == 'USER_JOINED') {
        if(state.onlineUsers) {
            state = Object.assign({}, state, {
                onlineUsers: state.onlineUsers.concat(action.newUser)
            });
        }
    }
    if (action.type == 'USER_LEFT') {
        state = Object.assign({}, state, {
            onlineUsers: state.onlineUsers.filter(function(onlineUser) {
                return onlineUser.id != action.leaverId;
            })
        });
    }
    if (action.type == 'CHAT_MESSAGES') {
        state = Object.assign({}, state, {
            messages: action.messages.reverse()
        });
    }
    if (action.type == 'CHAT_MESSAGE') {
        if(state.messages) {
            state = Object.assign({}, state, {
                messages: state.messages.concat(action.newMessage)
            });
        }
    }
    if (action.type == 'FRIEND_REQUESTS') {
        state = Object.assign({}, state, {
            requests: action.requests
        });
    }
    if (action.type == 'NEW_FRIEND_REQUEST') {
        if(state.requests) {
            state = Object.assign({}, state, {
                requests: parseInt(state.requests) + parseInt(action.newRequest)
            });
        }
    }
    if (action.type == 'ACCEPT_PENDING_REQUEST') {
        if(state.requests) {
            state = Object.assign({}, state, {
                requests: parseInt(state.requests) + parseInt(action.changeOfRequests)
            });
        }
    }
    // if (action.type == 'CANCELED_REQUEST') {
    //     if(state.requests) {
    //         state = Object.assign({}, state, {
    //             requests: parseInt(state.requests) + parseInt(action.changeOfRequest)
    //         });
    //     }
    // }
    return state;
}
