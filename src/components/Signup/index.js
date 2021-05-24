import React, {Component} from 'react';
import {Form, Input, Button, FormInstance} from 'antd';
import * as dayjs from 'dayjs';
import qs from 'qs';

import "./Signup.scss"

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};
const tailLayout = {
  wrapperCol: {offset: 0, span: 24},
};




class Signup extends Component{
  state = {
    eventName: "Event name",
    eventDate:  dayjs().format("DD MMMM hh:mm"), //"20 february 16:30"
    email: "",
    signupDone: false,
    isBookingCanceled: false,
  };

  formRef = React.createRef();

  onFinish(values) {
    this.setState({
      signupDone: true
    })
  };

  onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  };

  componentDidMount() {
    const queryParams = qs.parse(window.location.search, {ignoreQueryPrefix: true});

    const eventName = queryParams.name? queryParams.name.toString() : this.state.eventName;
    const eventDate = queryParams.date ? dayjs.unix(parseInt(queryParams.date.toString(), 10)).format("DD MMMM hh:mm")
      : this.state.eventDate;
    const email = queryParams.email? queryParams.email.toString() : this.state.email;

    this.setState({
      eventName,
      eventDate
    });

    this.formRef.current.setFieldsValue({
      "email": email
    });

    if(email.length) {
      this.formRef.current.validateFields();
    }
  }

  handleSubmitButtonDisability() {
    if(this.formRef.current === null) return  false;

    return !this.formRef.current.isFieldsTouched(true) ||
    !!this.formRef.current.getFieldsError().filter(({ errors }) => errors.length).length
  }

  handleCancelBooking() {
    this.setState({
      isBookingCanceled: true
    })
  }
  render() {
    const {eventName, eventDate, email, signupDone, isBookingCanceled} = this.state;

    return (
      <div className="signup-container">
        {!isBookingCanceled && (<div className="signup">
          <div className="event-details">
            <h1 className="event-name">{eventName}</h1>
            <h3 className="event-date">{eventDate}</h3>
          </div>
          {!signupDone && (
            <div className="user-info">
              <h2>Sign up for a spot</h2>
              <Form
                ref={this.formRef}
                {...layout}
                name="basic"
                onFinish={(values) => this.onFinish(values)}
                onFinishFailed={(errorInfo) => this.onFinishFailed(errorInfo)}
              >
                <Form.Item
                  name="email"
                  rules={[
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                    {
                      required: true,
                      message: 'E-mail!',
                    },
                  ]}
                  initialValue={email}
                >
                  <Input placeholder="Email"/>
                </Form.Item>
                <Form.Item {...tailLayout} shouldUpdate>
                  {() =>(
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={this.handleSubmitButtonDisability()}
                    >
                      SIGN UP FOR THE EVENT
                    </Button>
                  )}
                </Form.Item>
              </Form>
            </div>
          )}
          {signupDone && (
            <div className="signup-complete">
              <h3>Thanks for signing up</h3>
              <h3 className="cancel-booking" onClick={() => this.handleCancelBooking()}>Cancel Booking</h3>
            </div>
          )}

        </div>)}
        {isBookingCanceled && (
          <div className="canceled-booking-container">
            <h3>Spot is Canceled</h3>
          </div>
        )}
      </div>
    )
  }

}

export default Signup;
