
from odoo import api, fields, models


class DoneTimer(models.TransientModel):
    _name = "done.timer"

    time = fields.Float(string="Time")
    explication = fields.Char(string="Explication")

    def update_lines(self):
        current_task = self.env['project.task'].browse(self._context.get('task_id'))
        self.env['account.analytic.line'].sudo().create({
            'date': fields.Datetime.now(),
            'employee_id': self.env.user.employee_id.id,
            'name': self.explication,
            'unit_amount': self.time,
            'project_id': current_task.project_id.id,
            'task_id': current_task.id,
            'account_id': current_task.project_id.analytic_account_id.id
        })
        current_task.update({
            'duration': 0
        })
        return True
