import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as io from 'socket.io-client';


class Chat extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props);

        this.state = {
            messageInput: ''
        };

        this.keyPress = this.keyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);

    }


    componentDidUpdate() {
        this.elem.scrollTop = this.elem.scrollHeight;
    }


    keyPress(event) {

        if(event.keyCode == 13){
            // console.log(event.target.value);

            this.props.socket.emit('chatMessage', {
                message: event.target.value,
                userId: this.props.userId
            });

            this.setState({
                messageInput: ''
            });

        }
    }


    handleChange(event) {

        this.setState({
            messageInput: event.target.value
        });

    }


    render() {

        if(!this.props.messages) {
            return null;
        }

        // console.log(this.props.messages);

        const messages = (
            <div id='messages-container' ref={elem => this.elem = elem}>
            {this.props.messages.map((user) =>
                <div>
                    <img className='message-image' src={user.image ? user.image : '../images/profile.png'} />
                    <div className='message-text'>
                        <p className='message-name'>{user.first_name} {user.last_name}</p>
                        <p className='message-timestamp'>{new Date(user.timestamp).toLocaleDateString()}, {new Date(user.timestamp).toLocaleTimeString()}</p>
                        <p className='message'>{user.message}</p>
                    </div>
                </div>
            )}
            </div>
        )

        return (
            <div id='chat-container'>
                {messages}
                <textarea id='message-textarea' value={this.state.messageInput} onKeyDown={this.keyPress} onChange={this.handleChange} rows="8" cols="55" placeholder="Write your message here..." />
            </div>
        );

    }

}


const mapStateToProps = function(state) {
    return {
        messages: state.messages && state.messages
    }
}

export default connect(mapStateToProps)(Chat);
