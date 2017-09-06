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

        this.showUploader = this.showUploader.bind(this);
        this.submit = this.submit.bind(this);
        this.hidePicUpload = this.hidePicUpload.bind(this);

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


    showUploader() {
        this.setState({uploadDialogVisible: true})
    }


    hidePicUpload() {
        this.setState({uploadDialogVisible: false})
    }


    submit(event) {
        var file = event.target.files[0];
        var userId = this.state.userId;

        var formData = new FormData();

        formData.append('file', file);
        formData.append('userId', userId);

        axios({
            method: 'post',
            url: '/upload',
            data: formData,
            processData: false,
            contentType: false
        })
        .then(({data}) => {
            if(data.success) {
                this.setState({
                    uploadDialogVisible: false
                })
                window.location.reload()
            }
        }).catch(function (error) {
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
                <header>
                    <div id='small-profile-pic-container'>
                        <ProfilePic profilePicUrl={this.state.profilePicUrl} firstName={this.state.firstName} showUploader={this.showUploader} />
                        {this.state.uploadDialogVisible && <ProfilePicUpload submit={this.submit} hidePicUpload={this.hidePicUpload} />}
                    </div>
                    <div className='links-container'>
                        <Link className='link' to='/friends'>Friends</Link>
                        <Link className='link' to='/online'>See who is online now</Link>
                        <Link className='link' to='/chat'>Chat</Link>
                        <a href="/logout" className='link'>Log Out</a>
                    </div>
                    <div id='logo-container'><Logo />
                    </div>
                </header>
                <main>
                    <Socket>
                        {children}
                    </Socket>
                </main>
            </div>
        );
    }
}

export function ProfilePic(props) {
    return (
        <img id='small-profile-pic'
        src={props.profilePicUrl}
        alt={props.firstName}
        onClick={props.showUploader}/>
    );
}


function ProfilePicUpload(props) {
    return (
        <div id='profile-pic-upload-container'>
            <p id="hide-upload" onClick={props.hidePicUpload}>X</p>
            <h3>Want to change your image?</h3>
            <div id="pic-file-upload">
                <span>Upload</span>
                <input type="file" id="pic-upload-button" onChange={props.submit} />
            </div>
        </div>
    );
}
