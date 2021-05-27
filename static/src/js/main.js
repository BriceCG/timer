odoo.define('my_custom.timer',function(require){
    "use strict"

    var Widget = require('web.Widget');
    var widgetRegistry = require('web.widget_registry');

    var TimerCount = Widget.extend({
        template: 'timer_count_template',
        events: {
            'click #start': '_start_count',
            'click #pause': '_pause_count',
            'click #stop': '_stop_count'
        },
        init: function(parent,value){
            this._super(parent);
            this.record = value.data;
            var self = this;
        },
        willStart: function(){
            var self = this;
            var initialize_duration = this._rpc({
              'model': 'project.task',
              'method': 'search_read',
              'domain': [["id","=",self.record.id]],
              'limit': 1
            }).then(function(data){
                self.task = data[0]
                self.count = self.task.duration * 1000

            })
            return Promise.all([
                this._super.apply(this, arguments),
                initialize_duration
            ])
        },
        start: function(){
            var self = this;
//            If the chronometer is started
            if (self.task.is_started){
                self._start_count()
            }
            else if(!self.task.is_started) {
                self._pause_count()
            }

            return Promise.all([
                self.$('.counter').html($('<span>' + moment.utc(self.count).format("HH:mm:ss") + '</span>'))
            ])
        },

        _start_count: function(){
            var self = this
            self.$('#start').hide()
            self.$('#pause').show()
            // When starting the counter update the is_started field to True if not true
            if (! self.task.is_started){
                this._rpc({
                  model: 'project.task',
                  method: 'write',
                  args: [[this.record.id],{
                  'is_started': true,
                }]
                }).then(function(data){
                    self.task.is_started = true

                })
            }
            // Update the count timer
            this.timer = setInterval(function(){
                self._updateDuration();
            },1000)
        },
        _updateDuration: function(){
            var self = this
            console.log(self.duration)
            // Update the duration
            self.count+=1000;
            this.$('.counter').html($('<span>' + moment.utc(self.count).format("HH:mm:ss") + '</span>'));

        },
        _pause_count: function(){
            var self = this;
             self.$('#pause').hide()
             self.$('#start').show()
            if (self.task.is_started){
                this._rpc({
                  model: 'project.task',
                  method: 'write',
                  args: [[this.record.id],{
                  'is_started': false,
                  'duration': self.count/1000
                }]
                }).then(function(data){
                    self.task.is_started = false;

                })
            }

            clearInterval(this.timer)
        },
        _stop_count: function(){
            var self = this;
            this._rpc({
                method: 'write',
                model: 'project.task',
                args: [[this.record.id],{
                    'is_started': false
                }]
            })
            this.do_action({
                res_model: 'done.timer',
                views: [[false, 'form']],
                target: 'new',
                type: 'ir.actions.act_window',
                context: {'default_time': (self.count/1000)/3600,
                           'task_id': self.record.id
                }
            })
        }
    })

    widgetRegistry.add('timer_count', TimerCount);
    return TimerCount
})