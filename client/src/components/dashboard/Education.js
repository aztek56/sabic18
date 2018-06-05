import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { deleteEducation } from '../../actions/profileAction';

class Education extends Component {
    onDeleteClick(id) {
        this.props.deleteEducation(id);
    }

    render() {
        const education = this.props.education.map(edu => (
            <tr key={edu._id}>
                <td>{edu.school}</td>
                <td>{edu.degree}</td>
                <td>{edu.fieldofstudy}</td>
                <td>
                    <Moment format="YYY/MM/DD">{edu.from}</Moment> -{' '}
                    {edu.to === null ? 'Now' :
                        <Moment format="YYY/MM/DD">{edu.to}</Moment>}
                </td>
                <td><button
                    className="btn btn-danger"
                    onClick={this.onDeleteClick.bind(this,edu._id)}
                > Delete</button> </td>
            </tr>
        ));
        return(
            <div className="experience">
                <h4 className="mb-4"> Education</h4>
                <table className="table">
                    <thead>
                    <tr>
                        <th>School</th>
                        <th>Degree</th>
                        <th>Program</th>
                        <th>Years</th>
                        <th></th>
                    </tr>
                    { education }
                    </thead>

                </table>

            </div>
        );
    }
};

Education.propTypes = {
    deleteEducation: PropTypes.func.isRequired
}

export default connect(null, { deleteEducation })(Education);