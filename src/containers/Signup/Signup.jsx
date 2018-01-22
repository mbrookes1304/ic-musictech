import React from "react";
import styled from "styled-components";
import AWS from "aws-sdk";

import Separator from "../../components/Separator/Separator.jsx";
import SessionInfo from "../../components/SessionInfo/SessionInfo.jsx";

if (process.env.NODE_ENV === "production") {
  // Use AWS
  AWS.config.update({
    region: "eu-west-1"
  });
} else {
  // Use local development version
  AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "AAAAAAAAAAAAAAAAAAAA",
      secretAccessKey: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }
  });
}

const Wrapper = styled.div``;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 250px;
  margin: 0 auto;
  padding-bottom: 10px;
`;

const LeftAlignWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
`;

const Label = styled.label`
  align: left;
  font-size: 11px;
  color: #3e3e3e;
  margin-top: 10px;
`;

const Input = styled.input`
  width: 100%;
`;

const SlotWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Error = styled.div``;

class Signup extends React.Component {

  constructor() {
    super();
    this.state = {
      slot: "slot1",
    };
    this.slots = {
      slot1: "7pm - 8pm",
      slot2: "8pm - 9pm",
      slot3: "9pm - 10pm"
    };


    this.fetchSession = this.fetchSession.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleGenreChange = this.handleGenreChange.bind(this);
    this.handlePartnerChange = this.handlePartnerChange.bind(this);
    this.handleSlotChange = this.handleSlotChange.bind(this);

    this.fetchSession();
  }

  fetchSession() {
    // Retrieve latest session from DB
    const docClient = new AWS.DynamoDB.DocumentClient();
    let component = this;

    var params = {
      TableName : "musictech-sessions",
      KeyConditionExpression: "#name = :session",
      ExpressionAttributeNames:{
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":session":"session"
      },
      Limit: 1,
      ScanIndexForward: false
    };

    docClient.query(params, function(err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        component.setState({
          location: "Metric",
          date: "Next Monday"
        });
      } else {
        data.Items.forEach(function(item) {
          component.setState({
            location: item["location"],
            date: item["session-date"],
          });
        });
      }
    });
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  handleGenreChange(e) {
    this.setState({
      genre: e.target.value,
    });
  }

  handlePartnerChange(e) {
    this.setState({
      partner: e.target.value,
    });
  }

  handleSlotChange(e) {
    this.setState({
      slot: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const dynamodb = new AWS.DynamoDB();
    let component = this;
    var params = {
      Item: {
        "signup-id": {
          S: `${this.state.date}:${this.state.name}`
        },
        "name": {
          S: this.state.name,
        },
        "session-date": {
          S: this.state.date,
        },
        "genre": {
          S: this.state.genre,
        },
        "partner": {
          S: this.state.partner || " ",
        },
        "slot": {
          S: this.slots[this.state.slot],
        }
      },
      ReturnConsumedCapacity: "TOTAL",
      TableName: "musictech-signups"
    };
    dynamodb.putItem(params, function(err) {
      if (err) {
        component.setState({
          error: "Unable to sign up currently",
        });
      } else {
        component.setState({
          error: "Successfully signed up",
        });
      }
    });
  }

  render() {
    return (
      <Wrapper>
        <p>Join us on Monday from 7-10 for DJ sessions and on Tuesday from 7-10 for Production sessions. Sign up for the next DJ session below.</p>
        <Separator />
        <SessionInfo date={this.state.date} location={this.state.location} />
        <FormWrapper>
          <form onSubmit={this.handleSubmit}>
            <LeftAlignWrapper>
              <Label for="signupname">Name: </Label>
            </LeftAlignWrapper>
            <Input type="text" id="signupname" onChange={this.handleNameChange} required />
            <LeftAlignWrapper>
              <Label for="genre">Genre: </Label>
            </LeftAlignWrapper>
            <Input type="text" id="genre" onChange={this.handleGenreChange} required />
            <LeftAlignWrapper>
              <Label for="partner">Partner (optional): </Label>
            </LeftAlignWrapper>
            <Input type="text" id="partner" onChange={this.handlePartnerChange} />
            <LeftAlignWrapper>
              <Label>Choose a slot:</Label>
            </LeftAlignWrapper>
            <SlotWrapper>
              <LeftAlignWrapper>
                <input type="radio" id="slot1" value="slot1" onChange={this.handleSlotChange} checked={this.state.slot === "slot1"}/>
                <label htmlFor="slot1">{this.slots["slot1"]}</label>
              </LeftAlignWrapper>
              <LeftAlignWrapper>
                <input type="radio" id="slot2" value="slot2" onChange={this.handleSlotChange} checked={this.state.slot === "slot2"}/>
                <label htmlFor="slot2">{this.slots["slot2"]}</label>
              </LeftAlignWrapper>
              <LeftAlignWrapper>
                <input type="radio" id="slot3" value="slot3" onChange={this.handleSlotChange} checked={this.state.slot === "slot3"}/>
                <label htmlFor="slot3">{this.slots["slot3"]}</label>
              </LeftAlignWrapper>
            </SlotWrapper>
            <button>Signup</button>
            <Error>{this.state.error}</Error>
          </form>
        </FormWrapper>
      </Wrapper>
    );
  }
}

export default Signup;
