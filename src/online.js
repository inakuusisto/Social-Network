import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';


class Online extends React.Component {

    render() {

        if(!this.props.onlineUsers) {
            return null;
        }

        // console.log(this.props.onlineUsers);

        const friends = (
            <div>
            {this.props.onlineUsers.map((user) =>
                <div className='online-user'>
                <Link to={"/user/"+user.id}>
                <img className='friends-image' src={user.image ? user.image : '../images/profile.png'} />
                </Link>
                <p className='online-user-name'>{user.first_name} {user.last_name}</p>
                </div>
            )}
            </div>
        )

        return (
            <div>
            <div id='small-profile-pic-container'><ProfilePic profilePicUrl={this.props.profilePicUrl} firstName={this.props.firstName} /><div className='links-container'><Link className='link' to='/friends'>Friends</Link> <Link className='link' to='/online'>See who is online now</Link><Link className='link' to='/chat'>Chat</Link><a href="/logout" className='link'>Log Out</a></div></div>
            <div id='online-container'>
            <p id='online-heading'>Online Now</p>
            {this.props.onlineUsers.length ? friends : <p className='friends-heading'>None of your friends are online now</p> }
            </div>
            </div>
        );

    }

}


function ProfilePic(props) {
    return (
        <img id='small-profile-pic'
        src={props.profilePicUrl}
        alt={props.firstName}
        />
    );
}


const mapStateToProps = function(state) {
    return {
        onlineUsers: state.onlineUsers && state.onlineUsers
    }
}

export default connect(mapStateToProps)(Online);
