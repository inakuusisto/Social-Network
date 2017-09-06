import React from 'react';
import axios from './axios';
const awsS3Url = "https://s3.amazonaws.com/inasocial";
import { Link } from 'react-router';


export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bioinput: ''
        };

        this.showEditBio = this.showEditBio.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);

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


    showEditBio() {
        this.setState({editBioVisible: true})
    }

    handleChange(event) {
        this.setState({
            bioinput: event.target.value
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
                <div id='profilepic-and-text-container'>
                    <img id='big-profile-pic' src={this.props.profilePicUrl} />
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


function ProfileEdit(props) {
    return (
        <form onSubmit={props.handleSubmit}>
        <textarea id='profile-textarea' rows="10" cols="55" value={props.bioinput} onChange={props.handleChange} /><br />
        <input id="bio-edit-button" type="submit" value="Save" />
        </form>
    );
}
