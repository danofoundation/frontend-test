const { Builder, By, Key, until } = require('selenium-webdriver');
const { describe, beforeAll, afterAll, it, expect } = require('@jest/globals');
const fetchMock = require('jest-fetch-mock');
const { disconnect, checkSession, isConnected } = require('./meta')
global.console = {
  log: jest.fn(), 
  error: jest.fn(), 
};

global.fetch = fetch;

describe('Login with MetaMask', () => {
  let driver;

  beforeAll(async () => {
   
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5000/');
    const connectButton = await driver.wait(until.elementLocated(By.id('connect')), 10000);
    await driver.wait(until.elementIsVisible(connectButton), 10000);
    global.console.log.mockClear();
    global.console.error.mockClear();
  });

  it('should display "CONNECT" initially', async () => {
    try {
      const connectButton = await driver.findElement(By.id('connect'));
      const text = await connectButton.getText();
      console.log('Connect button text:', text);
      expect(text).toEqual('CONNECT');
    } catch (error) {
      console.error('Error:', error);
      throw error; 
    }
  });
  
  it('should change button text to "Connecting..." after clicking', async () => {
    try {
      const connectButton = await driver.findElement(By.id('connect'));
      await connectButton.click();
      const buttonText = await connectButton.getText();
      console.log('Button text after click:', buttonText);
      expect(buttonText).toEqual('CONNECTING...');
    } catch (error) {
      console.error('Error:', error);
      throw error; 
    }
  });
  
  it('should show alert when MetaMask is not installed', async () => {
    try {
      const connectButton = await driver.findElement(By.id('connect'));
      await connectButton.click();
      await driver.sleep(2000); 
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      console.log('Alert text:', alertText);
      expect(alertText).toEqual('Please install MetaMask');
    } catch (error) {
      console.error('Error:', error);
      throw error; 
    }
  });
  
});


describe('disconnect', () => {
  let connectText;
  beforeAll(async () => {
    fetchMock.resetMocks();
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5000/');
    const connectButton = await driver.wait(until.elementLocated(By.id('connect')), 10000);
    await driver.wait(until.elementIsVisible(connectButton), 10000);
  
  });
  

  it('should set button text to "Connect" after successful disconnection', async () => {
    try {
      fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });
      await disconnect();
      const connectButton = await driver.findElement(By.id('connect'));
      const text = await connectButton.getText();
      console.log('Connect button text:', text);
      expect(text).toEqual('CONNECT');
    } catch (error) {
      console.error('Error:', error);
      throw error; 
    }
  });
  
  it('should not change button text if disconnection fails', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500, statusText: 'Internal Server Error' });
    await disconnect();
    const connectButton = await driver.findElement(By.id('connect'));
    const text = await connectButton.getText();
    console.log('Connect button text:', text);
    expect(text).toEqual('CONNECT');
    
  });
  
  it('should set button text to "Connect" after multiple disconnections', async () => {
    // Mock fetch response for successful disconnection
    fetchMock.mockResponse(JSON.stringify({}), { status: 200 });
    await disconnect();
    await disconnect();
    
    const connectButton = await driver.findElement(By.id('connect'));
    const text = await connectButton.getText();
    console.log('Connect button text:', text);
    expect(text).toEqual('CONNECT');
  });
});

describe('checkSession', () => {
  let connectText;
  beforeAll(async () => {
    fetchMock.resetMocks();
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5000/');
    const connectButton = await driver.wait(until.elementLocated(By.id('connect')), 10000);
    await driver.wait(until.elementIsVisible(connectButton), 10000);
  
  });

  it('should set button text to "Disconnect" and isConnected to true on successful session', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    await checkSession();
    const connectButton = await driver.findElement(By.id('connect'));
    const text = await connectButton.getText();
    expect(text).toEqual('CONNECT');
    expect(isConnected).toBe(false);
  });
  it('should set button text to "Connect" and isConnected to false on unsuccessful session', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: false }));

    await checkSession();
    const connectButton = await driver.findElement(By.id('connect'));
    const text = await connectButton.getText();
    expect(text).toEqual('CONNECT');
    expect(isConnected).toBe(false);
  });

  it('should handle network error and set button text to "Connect" and isConnected to false', async () => {
    fetchMock.mockReject(new Error('Network error'));

    await checkSession();
    const connectButton = await driver.findElement(By.id('connect'));
    const text = await connectButton.getText();
    expect(text).toEqual('CONNECT');
    
    expect(isConnected).toBe(false);
  });

  it('should log error message on failed response', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });

    await checkSession();
    const connectButton = await driver.findElement(By.id('connect'));
    const text = await connectButton.getText();
    expect(text).toEqual('CONNECT');
    expect(isConnected).toBe(false);
    
  });
  
});
