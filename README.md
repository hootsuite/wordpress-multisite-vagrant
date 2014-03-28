### *Project Status Update*

*This project was started early in 2013 and the associated internal project was never completed and shipped. Consequently it is not under active development or being updated. Pull requests for updates will be reviewed and accepted where appropriate.*

# Vagrant and Wordpress Multi Site

## Overview

HootSuite needed a Vagrant box that was configured to host Wordpress Multisite complete with custom domain mapping. At the outset of the project our requirements were:

* Vagrant box tuned for Wordpress Multi Site Development
* Build tools contained on the Vagrant Box that easily work with multiple themes
* Ability to map domains with high degree of flexibility

This project solves a niche issue for us in a very particular way and there are many things required to make this 100% stable and usable for any project required to do after this starting point. 

## Preparation

* Install [Vagrant](http://www.vagrantup.com/) (last tested with 1.5)
* [Installation Instructions](http://docs.vagrantup.com/v2/installation/index.html)

### How to access the Database on the Vagrant Box
During the following steps accessing the database is required. The Vagrant box includes MySQL but not phpMyAdmin. Use [Sequel Pro](http://www.sequelpro.com/) to connect to the database using these settings: 

* MySql Host: `127.0.0.1`
* Username: `root`
* Password: `leave this blank`
* Database: `wordpress` 
* Port: `don't edit this`
* SSH Host: `127.0.0.1`
* SSH User: `vagrant`
* SSH Password: `vagrant`
* SSH Port: `2222`

This Vagrant box by default includes a database called `Wordpress`. These instructions will always use and reference the `Wordpress` DB however others can be added and used as required.

### Editing Local Hosts File

Vagrant needs an IP in order to initialize a server but we want to map subdomains to mirror our production environment. For this example, use `wordpress.mydomain.com` as the parent installation path and create `site1.mydomain.com`, `site2.mydomain.com` etc. For development `.local` top level domains will be used. 

Prior to installing Wordpress edit your local `/etc/hosts`/ file to include these lines: 

```
192.168.37.21 wordpress.mydomain.local
192.168.37.21 site1.mydomain.local
192.168.37.21 site1.wordpress.mydomain.local
```

* The IP listed is taken from the Vagrantfile
* Lines 2 and 3 are required for Wordpress to set up and then domain map domains when they are added
* Lines 2 and 3 can be repeated to add more sites (site2, site3 etc)
* `mydomain.local` can be replaced with project specific URL's

### Shared Folders

This Vagrant Box has two folders that are shared between your local machine.

| Local Path  | Vagrant Path  |
| ------------- | ------------- | 
| /       | /vagrant/   |
| /www/     | /ebs1/www/  |


## Getting Started

### Initialization
* Clone the repository: `git clone https://github.com/hootsuite/wordpress-multisite-vagrant.git projectName`
* Navigate to the Vagrant folder `cd projectName/config/vagrant/`
* Download the Vagrant Box and `vagrant up` to initialize the virtual machine
* Load `http://wordpress.mydomain.local` to test if everything is working, if not visit [Vagrant Docs](http://docs.vagrantup.com/v2/) to troubleshoot.


### Install Wordpress MultiSite

* Remove `index.php` in the Vagrant `/www/` folder (it's there to confirm installation went properly)
* [Install Wordpress](http://codex.wordpress.org/Installing_WordPress) in the `www` folder
* [Configure Wordpress for multisite](http://codex.wordpress.org/Create_A_Network)
   * when prompted select *sub domain* set up instead of *sub directories*
   * After creating the network there will be a red error at the top of the page (**Warning, Wildcard DNS may not be configured correctly!** ) Ignore this, as it is handled with local edits to `/etc/hosts`/ and domain mapping. 
* Install [Wordpress MU Domain Mapping](http://wordpress.org/extend/plugins/wordpress-mu-domain-mapping/) and [configure it](http://wordpress.org/extend/plugins/wordpress-mu-domain-mapping/installation/). **Note**: Follow steps 1-3. This plugin has unusual configuration options, read the configuration notes!

### Add a Domain 

* Ensure that the A records for the intended domain have been added to `/etc/hosts`
* **Menu: My Sites > Network Admin > Plugins** - *Network Enable* Wordpress MultiSite Domain Mapping Plugin
* **Menu: My Sites > Network Admin > Settings > Domain Mapping** -  Leave inputs blank and deselect everything except for 2. Permanent redirect and click **Save**
* **Menu: My Sites > Network Admin > Sites > Create New Site** Create your new site. Use the same site that you mapped in `/etc/hosts` (eg site1.wordpress.mydomain.local - we will remap this shortly)
* Get the ID of this site:
  * **Menu: My Site > Network admin > Sites**
  * Get the Site ID either by hovering over the `Domain title` or installing the [Show Site ID Columns Plugin](http://halfelf.org/hacks/site-id-columns-multisite/)
  * The first site created should be `id=2`
* **Menu: My Sites > Network Admin > Settings > Domains** - Under "New Domain" add:
  * Site ID = ID in the above step (eg 2)
  * Domain = New requested domain (`site1.mydomain.local`)
  * Primary: Leave this checked
* Visit [http://site1.mydomain.local](http://site1.mydomain.local) in the browser
* You're up and running! Enjoy a cold beverage! 

## Grunt

The Vagrant box includes [Grunt.js](http://gruntjs.com) preinstalled and is ready to use without installing it on your local machine. Alternatively you can install and configure Grunt on your own machine. 

### Installing Grunt

* SSH into the Vagrant Box `vagrant ssh` (while in `config/vagrant`) 
* Navigate to the directory containing all the configuration files (`cd /vagrant/config/grunt`)
* Install all of the plugins by running `npm install`.

This will install:

* [Less](https://github.com/gruntjs/grunt-contrib-less)
* [Sass](https://github.com/gruntjs/grunt-contrib-sass)
* [Compass](https://github.com/gruntjs/grunt-contrib-compass)
* [JSHint](https://github.com/gruntjs/grunt-contrib-JSHint)
* [Uglify](https://github.com/gruntjs/grunt-contrib-uglify)
* [Coffee Script](https://github.com/gruntjs/grunt-contrib-coffee)
* [Concat](https://github.com/gruntjs/grunt-contrib-concat)
* [Watch](https://github.com/gruntjs/grunt-contrib-watch)

### The Gruntfile
You can [customize your Gruntfile](http://gruntjs.com/configuring-tasks) how you want. These are the included tasks. 

First, replace our theme name with yours: 
```
theme: `/ebs1/www/wp-content/themes/hootsuite`
```

### Less

This Gruntfile presumes that you have a main css file (`css/less/styles.less`) that `@imports` all other ones for your project and compiles them to `css/styles.less`. If this isn't the case you'll need to edit the Gruntfile to reflect this. 

The following commands are available: 

* `grunt less:development` - builds the CSS but does not compress it
* `grunt less:production` - builds and compresses the CSS with yuicompress
* `grunt watch:less` - Watches all less files and runs `grunt less:development` when any file is saved

Any files that are not built from `css/less/styles.less` will have to have additional tasks written for them. (eg `css/less/ie.less`)

### Javascript
This Gruntfile works for multiple themes. For many projects, paths can be written directly into the Uglify tasks however for this project the Gruntfile looks for and parses a theme specific file (`js/dev/config.json`) and imports that into any tasks that require it. The syntax for the `js/dev/config.json` file is: 

```
  {
    "files": [
      "file1.js", 
      "file2.js"
    ]
  }
```

The following tasks are available to this list of files: 

* `grunt` watches LESS and JS and runs `grunt less:development`, `grunt uglify` and `grunt jshint` when files are saved
* `grunt jshint` Runs JSHint on `js/dev/scripts.js`
* `grunt uglify` Runs Uglify on all files specified in `js/dev/config.json` and builds to `js/scripts.min.js`
* `grunt watch:js` Runs Uglify and JSHint whenever `js/dev/scripts.js` is saved with

### Contributors

* Joe Ying - PHP Developer
* Jeff Waterfall - Front End / Wordpress Developer 
* [Steve Mynett](http://twitter.com/stevemynett) - Front End / Wordpress Developer