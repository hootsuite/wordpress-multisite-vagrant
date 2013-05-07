# Preamble

We needed a Vagrant box that was configured to host Wordpress Multisite complete with custom domain mapping. This is our solution. It is based on the following requirements: 

* Vagrant box tuned to Wordpress Development
* Build tools contained on the Vagrant Box that easily work with multiple themes
* Ability to map domains
* …more?


# Preperation

## Install Vagrant
Install [Vagrant](http://www.vagrantup.com/) (ideally 1.2.2 or greater) [Installation Instructions](http://docs.vagrantup.com/v2/installation/index.html)

## Accessing the Database
During following steps accessing the database is required. The Vagrant box includes MySQL but not phpMyAdmin. Instead use [Sequel Pro](http://www.sequelpro.com/) to connect to the database using these settings: 

* MySql Host: `127.0.0.1`
* Username: `root`
* Password: `leave this blank`
* Database: `wordpress` 
* Port: `don't edit this`
* SSH Host: `127.0.0.1`
* SSH User: `vagrant`
* SSH Password: `vagrant`
* SSH Port: `2222`

This Vagrant box includes a database called `Wordpress`. Others can be added if required. These instructions will always use and reference the `Wordpress` DB. 

## Local Hosts File

Vagrant needs an IP in order to initialize a server but we want to map subdomains to mirror our production environment. For our usecase, and for this example, we will be installing our site at `wordpress.mydomain.com` and want to create `site1.mydomain.com`, `site2.mydomain.com` etc. For development `.local` top level domain. 

Prior to installing Wordpress edit your local `/etc/hosts`/ file to include these lines: 

	192.168.37.21 wordpress.mydomain.local
	192.168.37.21 site1.mydomain.local
	192.168.37.21 site1.wordpress.mydomain.local


* The IP listed is taken from the Vagrantfile
* Lines 2 and 3 are required for Wordpress to set up and then domain map domains when they are added
* Lines 2 and 3 can be repeated to add more sites (site2, site3 etc)
* `mydomain.local` can be replaced with project specific URL's

## Vagrant Shared Folders

By default this Vagrant Box has two folders thare are shared between your local machine. These have been set in the Vagrant file.  

| Local Path 	| Vagrant Path	|
| -------------	| -------------	| 
| /				| /vagrant/		|
| /www/			| /ebs1/www/	|


# Getting Started


## Initilization
* Clone the repository: `git clone https://github.com/HootSuiteMediaInc/wordpress-multisite-vagrant.git projectName`
* Navigate to the Vagrant folder `cd projectName/config/vagrant/`
* Download the Vagrant Box and `vagrant up` to initialize the virtual machine
* Load `http://wordpress.mydomain.local` to test if everything is working, if not visit [Vagrant Docs](http://docs.vagrantup.com/v2/) to get started




## Install Wordpress MultiSite

* [Install Wordpress](http://codex.wordpress.org/Installing_WordPress) in the `www` folder and remove `index.php`
* [Configured Wordpress for multisite](http://codex.wordpress.org/Create_A_Network)
* Install [Wordpress MU Domain Mapping](http://wordpress.org/extend/plugins/wordpress-mu-domain-mapping/) and [configure it](http://wordpress.org/extend/plugins/wordpress-mu-domain-mapping/installation/). **Note**: Follow steps 1-3. This plugin has unusual configuration options, read the configuration notes!

## Add a Domain 

* Ensure that the A records for the intended domain have been added to `/etc/hosts`
* My Sites > Network Admin > Plugins | 'Network Enable' Wordpress MultiSite Domain Mapping
* My Sites > Network Admin > Settings > Domain Mapping | Leave inputs blank and deselect everything except for 2. Permanent redirect
* My Sites > Network Admin > Sites > Create New Site | Create your new site. Must match the <project> created in /etc/hosts
* Get the ID of this site by going to:
* My Site > Network admin > Sites
* Looking in the column for the site ID (if you don't see this, enable 'Show Site ID' plugin in Network Admin
* My Sites > Network Admin > Settings > Domains | Under "New Domain" add:
Site ID
* NEW destinations folder (site1.mydomain.com)
* Leave Primary checked
* Visit http://site1.mydomain .local in the browser
* You're up and running!

## Set up Grunt
We use [Grunt.js](http://gruntjs.com) as a task runner for everything from compiling CSS Propressors to JSHinting Javascript. If you want you can install and configure it on your computer but the beauty of Vagrant is that it has already been installed on the box and is ready for use. 

* SSH into the Vagrant Box `vagrant ssh` (while in config/vagrant) 
* Navigate to the directory containing all the config files (`cd /vagrant/config/grunt`)
* Install all of the plugins with `npm install`. This installs Less, Sass, Compass, JSHint, Uglify, Coffee Script, Concat and Watch.

## Our Gruntfile
You can [customize your Gruntfile](http://gruntjs.com/configuring-tasks) in many ways and included is the one that works for us and our set up making use of Less, JSHint, Uglify and watch. 

Replace this line with the name of the theme to be worked on: 
	
	theme: `/ebs1/www/wp-content/themes/hootsuite

### Grunt and Less
Our set up makes use of `css/less/styles.less` that uses `@import` to pull in all other files. Due to this set up, running the grunt task on this file will build `css/styles.css`. You also have access to the following commands by default: 

* `grunt less:development` - builds the CSS but does not compress it
* `grunt less:production` - builds and compresses the CSS with yuicompress
* `grunt watch:less` - Watches all less files and runs `grunt less:development` when any file is saved

Any files that are not built from `css/less/styles.less` will have to have inpendant commands written for them. eg `css/less/ie.less`

### Grunt and Javascript
We wanted this gruntfile to work for multiple themes in our Wordpress Multisite installation. Unlike LESS, which just can watch `css/less/styles.less` regardless of which project we're working on, the JS build configuration is going to be different for each project. Normally we would write this directly into the uglify task but abstracted it so that the gruntfile looks for and parses a theme specific `js/dev/config.json` and imports that into any tasks that require it. The syntax for the `js/dev/config.json` file is: 


	{"files": [
		"file1.js", 
		"file2.js"
	]}

Additionally the following tasks are available by default: 

* `grunt jshint` Runs JSHint on `js/dev/scriptsjs`. 
* `grunt uglify` Runs Uglify on all files specified in `js/dev/config.json` and builds `js/scripts.min.js`
* `grunt watch:js` Runs Uglify and JSHint whenever `js/dev/scripts.js` is saved with

### Default Grunt Task
* `grunt` watches LSS and JS and runs `grunt less:development`, `grunt uglify` and `grunt jshint` when files are saved. 