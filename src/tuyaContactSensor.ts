// Custom made wrapper for Tuya Cloud API

import hmacSHA256 from 'crypto-js/hmac-sha256';
import axios, {AxiosInstance} from 'axios';
import { TuyaDoorPlatform } from './platform';

/**
 * Tuya Cloud API custom interface
 * This object directly interfaces with Tuya's Cloud API
 * It uses the client id and secret key from the Tuya IOT platform
 * and uses them to generate the signs, tokens and everything needed
 * to get the contact sensors states.
 */
export class TuyaApi {
  private readonly secret: string;
  private readonly client_id: string;
  private lastToken: number;
  private access_token: string;
  private tokValidity: number;
  private api: AxiosInstance;

  /**
   * Object constructor, used to declare params and ensure type
   * @param platform Platform object used to log what the api does & get config
   */
  constructor(private readonly platform: TuyaDoorPlatform) {
    this.secret = this.platform.config.options.secret_id;
    this.client_id = this.platform.config.options.access_id;
    this.lastToken = 0;
    this.access_token = '';
    this.tokValidity = 7200; //by default a token is valid for 2h or 7200s

    // Setup a default axios object for easier rest calls
    this.api = axios.create({
      baseURL: 'https://openapi.tuya'+this.platform.config.options.cloudCode+'.com',
      headers: {
        'sign_method': 'HMAC-SHA256',
        'client_id': this.client_id,
      },
    });

    // Ask for a token on init, just in case
    const sign = this.HMAC_SHA256_CALC(this.client_id);
    this.api.get('/v1.0/token?grant_type=1', {
      headers: {
        'sign': sign.sign,
        't': sign.timestamp,
      },
    }).then((res) => {
      this.tokValidity = res.data.result.expire_time;
      this.lastToken = sign.timestamp;
      this.access_token = res.data.result.access_token;
    });
  }

  /**
   * Signature calculator
   * @param message The message to encrypt, check Tuya docs for more info
   */
  HMAC_SHA256_CALC(message) {
    const timestamp = new Date().getTime();
    const toCrypt = message + timestamp;
    const firstPass = hmacSHA256(toCrypt, this.secret);
    const hashed = firstPass.toString().toUpperCase();
    return {
      sign: hashed,
      timestamp: timestamp,
    };
  }

  /**
   * Function to get AND check the validity of a token
   * If the token is expired, it generates a new one
   */
  async getToken() {
    const timestamp = new Date().getTime();
    // Undefined check in case the token wasn't defined properly previously (this should not happen)
    if (timestamp - this.lastToken > this.tokValidity || this.access_token === undefined) {
      // regenerate an access token please 🥺
      this.platform.log.debug('Generating new token');
      const sign = this.HMAC_SHA256_CALC(this.client_id);
      return this.api.get('/v1.0/token?grant_type=1', {
        headers: {
          'sign': sign.sign,
          't': sign.timestamp,
        },
      }).then((res) => {
        this.tokValidity = res.data.result.expire_time;
        this.lastToken = timestamp;
        this.access_token = res.data.result.access_token;
      });
    } else {
      this.platform.log.debug('Valid token already here: ', this.access_token);
    }
  }

  /**
   * This function is used to
   * @param device_id
   */
  async getDoorSensorStatus(device_id) {
    await this.getToken();
    const sign = this.HMAC_SHA256_CALC(this.client_id + this.access_token);
    return this.api.get('/v1.0/devices/' + device_id, {
      headers: {
        'sign': sign.sign,
        't': sign.timestamp,
        'access_token': this.access_token,
      },
    }).then((res) => res.data.result.status[0].value ? 100 : 0);
  }
}