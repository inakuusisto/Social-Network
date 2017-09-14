import React from 'react';
import axios from './axios';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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


        axios.post('/login', {
            email: this.state.email,
            password: this.state.password
        })
        .then(({data}) => {
            if(data.success) {
                // console.log('success')
                location.replace('/');
            } else {
                this.setState({
                    error: true
                })
            }
        })
        .catch((error) => {
            this.setState({
                error: true
            })
        });
    }

    render() {
        return (
            <div id='login-container'>
                {this.state.error && <p className="error-message">Something went wrong. Please try again!</p>}
                <form onSubmit={this.handleSubmit}>
                    <input className='reg-input' type="text" name="email" value={this.state.email} onChange={this.handleInputChange} placeholder="Email" required /><br />
                    <input className='reg-input' type='password' name="password" value={this.state.password} onChange={this.handleInputChange} placeholder="Password" required /><br />
                    <input className='reg-button' type="submit" value="Login" />
                </form>
            </div>

        );

    }

}
