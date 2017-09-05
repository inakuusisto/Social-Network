import React from 'react';
import axios from './axios';
import { Logo } from './logo';
const awsS3Url = "https://s3.amazonaws.com/inasocial";
import Profile from './profile';
import * as io from 'socket.io-client';
import Socket from './socket';
import { Link } from 'react-router';
import { connect } from 'react-redux';


export default class App extends React.Component {
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
                profilePicUrl: data.image ? awsS3Url + '/' + data.image : '../images/profile.png'
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
            profilePicUrl: this.state.profilePicUrl
        });

        return (
            <div id='app'>
            <div id='logo-container'><Logo />
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
