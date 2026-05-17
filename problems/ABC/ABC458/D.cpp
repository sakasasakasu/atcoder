#include <bits/stdc++.h>
#include <queue>
using namespace std;
using ll = long long;

int main() {
    int X, Q;
    cin >> X >> Q;
    vector<int> A(Q), B(Q);
    for (int i = 0; i < Q; i++) {
        cin >> A.at(i) >> B.at(i);
    }

    priority_queue<int, vector<int>, greater<int> > right;
    priority_queue<int> left;
    int mid = X;
    for (int i = 0; i < Q; i++) {
        if (A.at(i) < mid) {
            left.push(A.at(i));
        } else {
            right.push(A.at(i));
        }
        if (B.at(i) < mid) {
            left.push(B.at(i));
        } else {
            right.push(B.at(i));
        }

        if (left.size() > right.size()) {
            right.push(mid);
            mid = left.top();
            left.pop();
        } else if (left.size() < right.size()) {
            left.push(mid);
            mid = right.top();
            right.pop();
        }
        cout << mid << endl;
    }
}


// thanks for https://algo-logic.info/abc023d/
