class Expense(models.Model):

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    public_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    # Employee who submitted the expense
    employee = models.ForeignKey(
        'users.Employee',
        on_delete=models.CASCADE,
        related_name='expenses'
    )

    # User who created the expense
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_expenses'
    )

    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        related_name='expenses'
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    expense_date = models.DateField()

    description = models.TextField()

    receipt = models.FileField(
        upload_to='expense_receipts/',
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    approved_at = models.DateTimeField(
        blank=True,
        null=True
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    # Manager/Admin who approved or rejected the expense
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_expenses'
    )

    # Soft delete flag
    is_deleted = models.BooleanField(
        default=False
    )

    def __str__(self):
        return (
            f"{self.employee} - "
            f"{self.category.name} - "
            f"{self.amount}"
        )