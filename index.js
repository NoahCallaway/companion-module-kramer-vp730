var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(1,'Connecting'); // status ok!

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 23);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			default: '192.168.1.39',
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port',
			default: '23',
			regex: self.REGEX_NUMBER
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};


instance.prototype.actions = function(system) {
	var self = this;
	var actions = {
		'menu': { label: 'Menu'},
		'top': { label: 'Top'},
		'down': { label: 'Down'},
		'left': { label: 'Left'},
		'right': { label: 'Right'},
		'enter': { label: 'Enter'},

		'switch_input': {
			label: 'Switch input',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					choices: [
						{ id: '0', label: 'Input 1' },
						{ id: '1', label: 'Input 2' },
						{ id: '2', label: 'VGA 1'   },
						{ id: '3', label: 'VGA 2'   },
						{ id: '4', label: 'VGA 3'   },
						{ id: '5', label: 'VGA 4'   },
						{ id: '6', label: 'HDMI 1'  },
						{ id: '7', label: 'HDMI 2'  },
						{ id: '8', label: 'USB'     },
					]
				}
			]
		},
		'source_type_input1': {
			label: 'Source type input 1',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'scrType',
					choices: [
						{ id: '0', label: 'Component' },
						{ id: '1', label: 'YC'        },
						{ id: '2', label: 'Video'     }
					]
				}
			]
		},
		'source_type_input2': {
			label: 'Source type input 2',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'scrType',
					choices: [
						{ id: '0', label: 'Component' },
						{ id: '1', label: 'YC' },
						{ id: '2', label: 'Video' }
					]
				}
			]
		},
		'blank': {
			label: 'Blank Output',
			options: [
				{
					type: 'dropdown',
					label: 'Blank on/off',
					id: 'blankId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				}
			]
		},
		'freeze': {
			label: 'Freeze Output',
			options: [
				{
					type: 'dropdown',
					label: 'Freeze on/off',
					id: 'frzId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				}
			]
		},
		'mute': {
			label: 'Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Mute on/off',
					id: 'muteId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				}
			]
		},
		'custom': {
			label: 'custom command',
			options: [
				{
					type: 'textinput',
					id: 'custom'
				}
			]
		}
	};

	self.setActions(actions);
};




	instance.prototype.action = function(action) {
		var self = this;
		var opt = action.options;
		var id = action.action;
		var cmd;

		switch (id) {

			case 'menu':
				cmd = 'Y 0 93';
				break;

			case 'top':
				cmd = 'Y 0 94';
				break;

			case 'down':
				cmd = 'Y 0 95';
				break;

			case 'left':
				cmd = 'Y 0 96';
				break;

			case 'right':
				cmd = 'Y 0 97';
				break;

			case 'enter':
				cmd = 'Y 0 98';
				break;

			case 'freeze':
				cmd = 'Y 0 89 ' + opt.frzId;
				break;

			case 'blank':
				cmd = 'Y 0 90 ' + opt.blankId;
				break;

			case 'switch_input':
				cmd = 'Y 0 0 '+ opt.input;
				break;

			case 'mute':
				cmd = 'Y 0 101 ' + opt.muteId;
				break;

			case 'source_type_input1':
				cmd = 'Y 0 1 ' + opt.scrType;
				break;

			case 'source_type_input2':
				cmd = 'Y 0 2 ' + opt.scrType;
				break;

			case 'command':
				cmd = opt.custom;
				break;

	}

	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + '\r');
		} else {
			debug('Socket not connected :(');
		}

	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;