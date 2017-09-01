import React from 'react';
import axios from './axios';
import { Logo } from './logo';
const awsS3Url = "https://s3.amazonaws.com/inasocial";
import Profile from './profile';
import * as io from 'socket.io-client';
import Socket from './socket';
import { Link } from 'react-router';
import { connect } from 'react-redux';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {

        axios.get('/user').then(({data}) => {
            this.setState({
                userId: data.id,
                firstName: data.first_name,
                lastName: data.last_name,
                profilePicUrl: data.image ? awsS3Url + '/' + data.image : '../images/profile.png',
                bio: data.bio
            })
        }).catch((error) => {
            console.log(error);
        });

    }


    render(props) {

        if(!this.state.firstName) {
            return null;
        }

        const children = React.cloneElement(this.props.children, {
            userId: this.state.userId,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            profilePicUrl: this.state.profilePicUrl,
            bio: this.state.bio
        });

        return (
            <div id='app'>
            <div id='logo-container'><Logo />
            {!this.props.requests || this.props.requests ==0 && <p id='pending-requests'></p>}
            {this.props.requests && this.props.requests !=0 && this.props.requests !=1 && <p id='pending-requests'>You have {this.props.requests} pending friend-requests</p>}
            {this.props.requests && this.props.requests ==1 && <p id='pending-requests'>You have {this.props.requests} pending friend-request</p>}
            </div>
            <div id='profile-container'>
            <Socket>
            {children}
            </Socket>
            </div>
            </div>
        );
    }
}

const mapStateToProps = function(state) {
    return {
        requests: state.requests && state.requests
    }
}

export default connect(mapStateToProps)(App);
