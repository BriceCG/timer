
from odoo import api, fields, models


class ProjectTask(models.Model):
    _inherit = 'project.task'

    duration = fields.Float()
    is_started = fields.Boolean()

    def engage(self):
        self.env['account.analytic.line'].create({
            'date': fields.Datetime.now(),
            'employee_id': 1,
            'name': 'test',
            'project_id': self.project_id.id,
            'task_id': self.id
        })


