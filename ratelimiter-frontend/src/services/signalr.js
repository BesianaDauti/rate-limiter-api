import * as signalR from "@microsoft/signalr";

const URL = "http://ratelimiterapi-env.eba-ppdfdmbw.eu-north-1.elasticbeanstalk.com";

class SignalRService {
  constructor() {
    this.connection = null;
  }

  start(token, onUpdate) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${URL}/statusHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on("StatusUpdate", (data) => {
      onUpdate(data);
    });

    return this.connection.start();
  }

  stop() {
    if (this.connection) {
      this.connection.stop();
    }
  }
}

export default new SignalRService();