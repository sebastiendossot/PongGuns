/**
 *
 * Game
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';

  var WIDTH_RAQUET = 90;
  var HEIGHT_RAQUET = 12;
  var PADDING_RAQUET = 20;
  var SIZE_BALL = 8;
/* eslint-disable react/prefer-stateless-function */
export class Game extends React.Component {

  constructor(props){
    super(props);
    var canvas = this.createCanvas()
    this.state = {has_ball: true,
      width_raquets: WIDTH_RAQUET,
      height_raquets: HEIGHT_RAQUET,
      padding_raquets: 20,
      size_ball: 8,
      canvas: canvas,
      ctx: canvas.getContext("2d"),
      initial_y_top: HEIGHT_RAQUET+PADDING_RAQUET+SIZE_BALL/2,
      initial_y_bottom: canvas.height - (HEIGHT_RAQUET+PADDING_RAQUET+SIZE_BALL + 5),
      board: {
        height: canvas.height,
        width: canvas.width,
        has_started: false
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", (event) => {this.processKeyPress(event)})
    this.initComponents();
  }

  initComponents(){
      const canvas = this.state.canvas;
      const draw = this.draw.bind(this);
      this.setState({
        raquet_top: {
          x: canvas.width/2 - this.state.width_raquets/2,
          y: this.state.padding_raquets,
          width: this.state.width_raquets,
          height: this.state.height_raquets,
          padding: this.state.padding_raquets
          // array of hits
        },
        raquet_bottom: {
          x: canvas.width/2 - this.state.width_raquets/2,
          y: canvas.height - (this.state.height_raquets + this.state.padding_raquets),
          width: this.state.width_raquets,
          height: this.state.height_raquets,
          padding: this.state.padding_raquets
        },
        ball: {
          x: canvas.width/2,
          y: this.state.initial_y_bottom,
          size: this.state.size_ball,
          speed: 0,
          angle: 0,
          effect: 0
        }
      }, () => draw())
  }

  draw(){
    this.state.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
    this.drawTopRaquet();
    this.drawBottomRaquet();
    this.drawBall(this.state.ball);
  }

  drawTopRaquet(){
    this.drawRaquet(this.state.raquet_top);
  }

  drawBottomRaquet(){
    this.drawRaquet(this.state.raquet_bottom);
  }

  drawRaquet(raquet){
    console.log("r")

    this.state.ctx.beginPath();
    this.state.ctx.fillStyle = "white";
    this.state.ctx.fillRect(raquet.x, raquet.y, raquet.width, raquet.height);
    this.state.ctx.stroke();
  }

  drawBall(ball){
    console.log("b")

    this.state.ctx.beginPath();
    this.state.ctx.fillStyle = "white";
    this.state.ctx.arc(ball.x, ball.y, ball.size, 0, 2 * Math.PI, false);
    this.state.ctx.fill();
    this.state.ctx.stroke();
  }

  processKeyPress(event){
    // event.preventDefault();
    // Put this with a callback
    this.updateBottomRaquet(event.key);

    console.log(event.key)
  }

  updateBottomRaquet(event){
    switch(event)
    {
     case "ArrowRight":
       this.state.raquet_bottom.x += 5;
       this.draw();
       break;
     case "ArrowLeft":
       this.state.raquet_bottom.x -= 5;
       this.draw();
       break;
     case " ":
       if(!this.state.board.has_started){
         this.state.board.has_started = true;
         this.startGame();
       }
       break;
     default:
       //nothing
     }
}

  createCanvas(){
    var canvas = document.createElement("canvas");
    canvas.style.marginLeft = "50%";
    canvas.style.bottom = "0";
    canvas.style.transform = "translateX(-50%)";
    canvas.style.backgroundColor = "#000000";
    canvas.style.overflowX = "hidden";
    // Do it dynamically
    canvas.height = 650;
    canvas.width = 600;
    document.getElementById("app").appendChild(canvas);
    return canvas;
  }

  startGame(){
    // Can do other things in the future but only animates the ball right now
    this.startBall(); // todo add class ball with that
  }

  startBall(){
    this.state.ball.speed = -1;
    this.moveBall();
  }

  moveBall(){
    if(this.state.ball.speed!=0){
      console.log(this.state.ball)
      if(this.checkBallPosition(this.state.ball)){
        this.state.ball.y += this.state.ball.speed;
        const draw = this.draw.bind(this);
        const updateBallPosition = this.updateBallPosition.bind(this);
        setTimeout(function(){
          draw();
          updateBallPosition();
        }, 5)
      }else{
        // Ball is out, back to initial state
        this.state.ball.speed = 0;
        this.state.board.has_started = false;
        console.log("is out");
        this.initComponents();
      }
    }
  }

  updateBallPosition(){
    this.moveBall()
  }

  checkBallPosition(ball){
    ball.y += ball.speed;
    // we need to consider the size of the ball

    //is not in the board
    const isInBoard = this.isInBoard(ball);

    if (this.isBouncingOnRaquet(ball)){
      this.state.ball.speed = - ball.speed;
    }
    // if ball is out, return false
    return isInBoard;
  }

  isInBoard(ball){
    const half_diameter = ball.size / 2 ; // that's stupid but I can't remember the word for half diameter in english
    const ball_min_x = ball.x - half_diameter;
    const ball_max_x = ball.x + half_diameter;
    const ball_min_y = ball.y - half_diameter;
    const ball_max_y = ball.y + half_diameter;

    return ball_min_x > 0 && ball_max_x < this.state.board.width && ball_min_y > 0 && ball_max_y < this.state.board.height;
  }

  isBouncingOnRaquet(ball){
    var condition = false;
    var raquet;
    //If speed >0, means it's going down so it could bounce the bottom raquet
    if (ball.speed > 0){
      raquet = this.state.raquet_bottom;
      //If the bottom of the ball is at least touching the the top of the raquet and maximum it's top is touching the bottom
      condition = ball.y + ball.size / 2 >= raquet.y && ball.y - ball.size / 2 < raquet.y + raquet.height;
    }else{
      raquet = this.state.raquet_top;
      condition = ball.y - ball.size / 2 <= raquet.y + raquet.height && ball.y + ball.size / 2 > raquet.y;
    }

    if (condition){
      condition = ball.x + ball.size / 2 > raquet.x && ball.x - ball.size / 2 < raquet.x + raquet.width;
    }

    return condition;
  }

  render() {
    return false;
    // return (
    //
    //     <div>
    //       {/* <canvas id="main-canvas" height="650px" width="600px">
    //       </canvas> */}
    //     </div>
    // );
  }
}

Game.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(Game);
