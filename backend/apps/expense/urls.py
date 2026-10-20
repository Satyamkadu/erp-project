from django.urls import path

from .views import (
    ExpenseListCreateView,
    ExpenseCategoryListCreateView
)


urlpatterns = [

    path(
        '',
        ExpenseListCreateView.as_view(),
        name='expense-list-create'
    ),

    path(
        'categories/',
        ExpenseCategoryListCreateView.as_view(),
        name='expense-category-list-create'
    ),
]