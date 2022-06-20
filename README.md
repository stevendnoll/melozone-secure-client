# Melozone Secure Client

The Melozone Secure Client is a free open-source JavaScript web client that lets users generate secure encrypted messages locally on their devices. It also provides a means to decrypt and read the secure messages.

## Setup

Clone this Git repository or download the source code. Copy the code to a folder path that is being served by a web server (example: /var/www/html/secure-client). The code has only been tested with Apache 2.4.41 running on Ubuntu. However, the code should work with any web server software that is able to serve static content (IIS, NGINX, Node.js, etc.).

## Usage

Browse to the Melozone Secure Client web interface in your web browser (the URL will depend on where you decide to host the code - in many cases, the URL will be something like https://localhost/secure-client or https://localhost:8080/secure-client).

## Support

This is a minimum viable product for an extremely secure messaging system. If you would like to report a bug or request new functionality, please ping me on Github.

## Disclaimer

The software is provided as-is, and though the goal was to make the messaging as secure as possible, leaks and cracks sometimes happen. I can make no guarantee that your messages will remain 100% secure. With that being said, the Melozone Secure Client is probably more secure than a vast majority of the messaging systems in use today.

## Dependencies

The only 3rd-party library used by this project is CryptoJS (v3.1.2). A copy of the CryptoJS library is included in this reposity in case the official project ever goes offline. CryptoJS is a completely separate project with which I have no affiliation.
