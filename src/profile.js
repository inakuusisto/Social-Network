import React from 'react';
import axios from './axios';
const awsS3Url = "https://s3.amazonaws.com/inasocial";
import { Link } from 'react-router';


export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bioinput: '',
            profilePicUrl: this.props.profilePicUrl
        };

        this.showUploader = this.showUploader.bind(this);
        this.showEditBio = this.showEditBio.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submit = this.submit.bind(this);
        this.hidePicUpload = this.hidePicUpload.bind(this);

    };

    componentDidMount() {

        axios.get('/bio').then(({data}) => {
            this.setState({
                bio: data.bio
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


    showEditBio() {
        this.setState({editBioVisible: true})
    }

    handleChange(event) {
        this.setState({
            bioinput: event.target.value
        });
    }


    submit(event) {
        var file = event.target.files[0];
        var userId = this.props.userId;

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
                    uploadDialogVisible: false,
                    profilePicUrl: awsS3Url + '/' + data.fileName
                })
            }
        }).catch(function (error) {
            console.log(error);
        });

    }


    handleSubmit(event) {
        event.preventDefault();

        axios.post('/bio', {
            bio: this.state.bioinput
        })
        .then(({data}) => {
            console.log(data.bio);
            if(data.success) {
                this.setState({
                    editBioVisible: false,
                    bio: data.bio
                })
            }
        }).catch(function (error) {
            console.log(error);
        });
    }


    render(props) {
        return (
            <div>
            <div id='small-profile-pic-container'><ProfilePic profilePicUrl={this.state.profilePicUrl} firstName={this.props.firstName} showUploader={this.showUploader} /><div className='links-container'><Link className='link' to='/friends'>Friends</Link> <Link className='link' to='/online'>See who is online now</Link><Link className='link' to='/chat'>Chat</Link><a href="/logout" className='link'>Log Out</a></div></div>
            {this.state.uploadDialogVisible && <ProfilePicUpload submit={this.submit} hidePicUpload={this.hidePicUpload} />}
            <div id='profilepic-and-text-container'>
            <img id='big-profile-pic' src={this.state.profilePicUrl} />
            <div id='profile-text'>
            <p id='username'>{this.props.firstName} {this.props.lastName}</p>
            {!this.state.bio && <p className='bio-link' onClick={this.showEditBio}>Add your bio now</p>}
            {this.state.bio && <p id='bio-text'>{this.state.bio}</p>}
            {this.state.bio && <p className='bio-link' onClick={this.showEditBio}>Edit</p>}
            {this.state.editBioVisible && <ProfileEdit handleSubmit={this.handleSubmit} value={this.state.bioinput} handleChange={this.handleChange} />}
            </div>
            </div>
            <div id='clear'></div>
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

function ProfileEdit(props) {
    return (
        <form onSubmit={props.handleSubmit}>
        <textarea id='profile-textarea' rows="10" cols="55" value={props.bioinput} onChange={props.handleChange} /><br />
        <input id="bio-edit-button" type="submit" value="Save" />
        </form>
    );
}
