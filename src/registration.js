import React from 'react';
import axios from './axios';
import { Link } from 'react-router';

export default class Registration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first: '',
            last: '',
            email: '',
            password: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };


    handleInputChange(event) {
        const value = event.target.value;
        const name = event.target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        axios.post('/register', {
            first: this.state.first,
            last: this.state.last,
            email: this.state.email,
            password: this.state.password
        }).then(({data}) => {
            if(data.success) {
                console.log('success')
                location.replace('/');
            } else {
                this.setState({
                    error: true
                });
            }
        }).catch(() => {
            this.setState({
                error: true
            });
        });

    }

    render() {
        return (
            <div id='reg-container'>
            {this.state.error && <p className="error-message">Oops, something went wrong. Please try again!</p>}
            <form onSubmit={this.handleSubmit}>
            <input className='reg-input' type="text" name="first" value={this.state.first} onChange={this.handleInputChange} placeholder="First name" required /><br />
            <input className='reg-input' type="text" name="last" value={this.state.last} onChange={this.handleInputChange} placeholder="Last name" required /><br />
            <input className='reg-input' type="text" name="email" value={this.state.email} onChange={this.handleInputChange} placeholder="Email" required /><br />
            <input className='reg-input' type='password' name="password" value={this.state.password} onChange={this.handleInputChange} placeholder="Password" required /><br />
            <input className='reg-button' type="submit" value="Submit" />
            </form>
            <p>If you are already a member, please <Link to='/login'>Login</Link></p>
            </div>

        );

    }

}
