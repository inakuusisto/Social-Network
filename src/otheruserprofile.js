import React from 'react';
import axios from './axios';
const awsS3Url = "https://s3.amazonaws.com/inasocial";
import { browserHistory } from 'react-router';
import { Link } from 'react-router';

export default class Otheruserprofile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleSendRequest = this.handleSendRequest.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleEndRequest = this.handleEndRequest.bind(this);
        this.handleAccept = this.handleAccept.bind(this);

    };

    componentDidMount() {

        if (this.props.params.id == this.props.userId) {
            browserHistory.push('/');
        }

        axios.post('/otheruserprofile', {
            id: this.props.params.id
        })
        .then(({data}) => {
            // console.log(data);
            this.setState({
                firstName: data.first_name,
                lastName: data.last_name,
                profilePicUrl: data.image ? awsS3Url + '/' + data.image : '../images/profile.png',
                bio: data.bio
            })
        }).catch((error) => {
            console.log(error);
        });


        axios.post('/status', {
            otherUserId: this.props.params.id
        })
        .then(({data}) => {
            const status = data.status;
            const requestor = data.request_id;

            if (!data || status !== 2 && status !== 1) {
                this.setState({
                    makeRequest: true
                })
            } else if (status == 2 && requestor == this.props.userId) {
                this.setState({
                    cancelRequest: true
                })
            } else if (status == 2 && requestor !== this.props.userId) {
                this.setState({
                    acceptRequest: true
                })
            } else {
                this.setState({
                    endFriendship: true
                })
            }
        }).catch((error) => {
            console.log(error);
        });
    }


    handleSendRequest() {

        axios.post('/makerequest', {
            status: 2,
            otherUserId: this.props.params.id
        })
        .then(({data}) => {
            console.log(data);
            if(data.success) {
                window.location.reload()
            }
        }).catch((error) => {
            console.log(error);
        });

        this.props.socket.emit('newFriendRequest', {
            otherUserId: this.props.params.id
        });

    }


    handleCancel() {

        axios.post('/cancel', {
            status: 4,
            otherUserId: this.props.params.id
        })
        .then(({data}) => {
            console.log(data);
            if(data.success) {
                window.location.reload()
            }
        }).catch((error) => {
            console.log(error);
        });

    }


    handleAccept() {

        axios.post('/accept', {
            otherUserId: this.props.params.id
        })
        .then(({data}) => {
            console.log(data);
            if(data.success) {
                window.location.reload()
            }
        }).catch((error) => {
            console.log(error);
        });

    }


    handleEndRequest() {

        axios.post('/end', {
            status: 5,
            otherUserId: this.props.params.id
        })
        .then(({data}) => {
            console.log(data);
            if(data.success) {
                window.location.reload()
            }
        }).catch((error) => {
            console.log(error);
        });

    }


    render(props) {
        return (
            <div>
            <div id='small-profile-pic-container'><ProfilePic profilePicUrl={this.props.profilePicUrl} firstName={this.props.firstName} /><div className='links-container'><Link className='link' to='/friends'>Friends</Link> <Link className='link' to='/online'>See who is online now</Link><Link className='link' to='/chat'>Chat</Link><a href="/logout" className='link'>Log Out</a></div></div>
            <div id='profilepic-and-text-container'>
            <img id='big-profile-pic' src={this.state.profilePicUrl} />
            <div id='profile-text'>
            <p id='username'>{this.state.firstName} {this.state.lastName}</p>
            <p id='bio'>{this.state.bio}</p>
            {this.state.makeRequest && <button className='friend-button' type='button' onClick={this.handleSendRequest}>Send friend request</button>}
            {this.state.cancelRequest && <button className='friend-button' type='button' onClick={this.handleCancel}>Cancel friend request</button>}
            {this.state.acceptRequest && <button className='friend-button' type='button' onClick={this.handleAccept}>Accept friend request</button>}
            {this.state.endFriendship && <button className='friend-button' type='button' onClick={this.handleEndRequest}>End friendship</button>}
            </div>
            </div>
            </div>
        );
    }
}


export function ProfilePic(props) {
    return (
        <img id='small-profile-pic'
        src={props.profilePicUrl}
        alt={props.firstName}
        />
    );
}
