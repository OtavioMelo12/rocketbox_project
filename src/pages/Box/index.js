import React, { Component } from 'react';
import api from '../../services/api.js';
import { formatDistance } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Dropzone from 'react-dropzone';
import socket from 'socket.io-client';

import { MdInsertDriveFile } from 'react-icons/md';

import './styles.css';

import logo from '../../assets/logo.svg';

export default class Box extends Component {

  state = {
    box: {},
  }

  async componentDidMount() {
    this.subscribeToNewFiles();

    const idBox = this.props.match.params.id;
    const response = await api.get(`/boxes/${idBox}`);

    this.setState({ box: response.data });
  }

  subscribeToNewFiles = () => {
    const idBox = this.props.match.params.id;
    const io = socket('https://rocketbox-backend2.herokuapp.com');

    io.emit('connectRoom', idBox);

    io.on('file', data => {
      this.setState({ box: { ...this.state.box, files: [data, ...this.state.box.files] } })
    })
  };

  convertHour(fileDate) {
    //2019-09-28T22:12:59.025Z
    const a = fileDate.replace("T", ",");
    const b = a.replace("Z", "")
    const c = b.replace("-", ",")
    const d = c.replace(":", ",")
    const e = d.replace("-", ",")
    const f = e.replace(":", ",")
    var result = f.split(',')
    var ano = parseInt(result[0]);
    var mes = parseInt(result[1]) - 1;
    var dia = parseInt(result[2]);
    var hora = parseInt(result[3] - 3);
    var minuto = parseInt(result[4]);
    var segundo = parseInt(result[5]);
    const total = [ano, mes, dia, hora, minuto, segundo];

    return total;
  }

  handleUpload = files => {
    files.forEach(file => {
      const data = new FormData();
      const idBox = this.props.match.params.id;

      data.append('file', file);

      api.post(`boxes/${idBox}/files`, data)
    });
  };

  render() {
    document.title = 'Rocketbox'
    return (
      <div id="box-container">
        <header>
          <img src={logo} alt="" />
          <h1>{this.state.box.title}</h1>
        </header>

        <Dropzone onDropAccepted={this.handleUpload}>
          {({ getInputProps, getRootProps }) => (
            <div className="upload" {...getRootProps()}>
              <input {...getInputProps()} />

              <p>Arraste arquivos ou clique aqui</p>
            </div>
          )}
        </Dropzone>

        <ul>
          {this.state.box.files && this.state.box.files.map(file => (
            <li key={file._id}>
              <a className="fileInfo" href={file.url} rel="noopener noreferrer" target="_blank">
                <MdInsertDriveFile size={24} color="#A5Cfff" />
                <strong>{file.title}</strong>
              </a>
              <span>{formatDistance(new Date(
                this.convertHour(file.createdAt)[0],
                this.convertHour(file.createdAt)[1],
                this.convertHour(file.createdAt)[2],
                this.convertHour(file.createdAt)[3],
                this.convertHour(file.createdAt)[4],
                this.convertHour(file.createdAt)[5]
              ),
                new Date(), {
                addSuffix: true,
                locale: pt,
              })}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
