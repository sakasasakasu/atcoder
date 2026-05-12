#include <bits/stdc++.h>
using namespace std; 

int main() {
    int N;
    cin >> N;

    vector<vector<int>> A(N);

    for (int i = 0; i < N; i++) {
        int L;
        cin >> L;
        A.at(i).resize(L);
        for (int j = 0; j < L; j++) {
            cin >> A.at(i).at(j);
        }
    }

    int X, Y;
    cin >> X >> Y;

    cout << A.at(X - 1).at(Y - 1) << endl;
}
