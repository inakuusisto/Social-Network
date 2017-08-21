import React from 'react';
import { connect } from 'react-redux';
import { acceptFriendRequest, endFriendship, receiveFriendRequests } from './actions'
import { Link } from 'react-router';


class Friends extends React.Component {

    componentDidMount() {
        if (!this.props.users) {
            this.props.dispatch(receiveFriendRequests());
        }
    }

    acceptFriendRequest(id) {
        this.props.dispatch(acceptFriendRequest(id));

        this.props.socket.emit('acceptPendingRequest', {
            userId: this.props.userId
        });
    }


    endFriendship(id) {
        this.props.dispatch(endFriendship(id));
    }

    render() {

        if(!this.props.users) {
            return null;
        }

        // console.log(this.props.users);

        const friendRequests = (
            <div>
            <p className='friends-heading'>These people want to be your friends</p>
            {this.props.users.filter(function(user) {
                return user.status == 2;
            }).map((user) =>
            <div className='friends-user'>
            <Link to={"/user/"+user.id}>
            <img className='friends-image' src={user.image ? user.image : '../images/profile.png'} />
            </Link>
            <p className='friends-name'>{user.first_name} {user.last_name}</p>
            <button className='friends-page-button' type='button' onClick={() => this.acceptFriendRequest(user.id)}>Accept friend request</button>
            </div>
        )}
        </div>
    )

    const friends = (
        <div>
        <p className='friends-heading'>These people are your friends</p>
        {this.props.users.filter(function(user) {
            return user.status == 1;
        }).map((user) =>
        <div className='friends-user'>
        <Link to={"/user/"+user.id}>
        <img className='friends-image' src={user.image ? user.image : '../images/profile.png'} />
        </Link>
        <p className='friends-name'>{user.first_name} {user.last_name}</p>
        <button className='friends-page-button' type='button' onClick={() => this.endFriendship(user.id)}>End friendship</button>
        </div>
    )}
    </div>
)


    return (
        <div>
        <div id='small-profile-pic-container'><ProfilePic profilePicUrl={this.props.profilePicUrl} firstName={this.props.firstName} /><div className='links-container'><Link className='link' to='/friends'>Friends</Link> <Link className='link' to='/online'>See who is online now</Link><Link className='link' to='/chat'>Chat</Link><a href="/logout" className='link'>Log Out</a></div></div>
        <div id='friends-container'>
        <div>
        {this.props.users.length ? friendRequests : <p className='friends-heading'>You don´t have any pending friend requests</p> }
        </div>
        <div id='friends'>
        {this.props.users.length ? friends : <p className='friends-heading'>You don´t have any friends</p>}
        </div>
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
        users: state.users
    }
}

export default connect(mapStateToProps)(Friends);
